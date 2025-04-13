import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ElementRef, AfterViewInit, Pipe, PipeTransform } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppBase } from '../../../app-base.component';
import { UiToasterService } from '../../core/services/toaster.service';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { PaymentComponent } from "../payment/payment.component";
import { GooglePlacesAutocompleteComponent } from '../../shared/ui/google-places/google-places.component';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Pipe({
  name: 'cardNumber',
  standalone: true
})
export class CardNumberPipe implements PipeTransform {
  transform(value: string): string {
    // Remove any non-digit characters from the input value
    const digitsOnly = value.replace(/\D/g, '');

    // Split the digits into groups of 4
    const groups = digitsOnly.match(/.{1,4}/g);

    // Join the groups with dashes
    const formattedValue = groups ? groups.join(' ') : '';

    return formattedValue;
  }
}
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NgbNavModule,
    PaymentComponent, PaymentComponent, GooglePlacesAutocompleteComponent, CardNumberPipe
  ],
  providers: [CardNumberPipe]
})
export class CheckoutComponent extends AppBase implements OnInit, AfterViewInit {
  selectedLocation: any = null;
  total_tax = 0;
  public searchElementRef!: ElementRef;
  tax_percentage = 0;
  subTotal = 0;
  total = 0;
  showAddressForm: boolean = false;
  selectedState: any = '5297c752-eaae-4e66-992e-fefd6f3ba2d4';
  activeTab = 1;
  addresses: any = [];
  stores: any = [];
  signUpForm!: any;
  ccForm!: any;
  storePickupForm!: any;
  deliveryForm!: any;
  shippingForm!: any;
  selectedTime: any;
  shippingCharges: number = 0;
  selectedBillingAddress: any;
  selectedPaymentMethod: any = 'card';
  imgBaseUrl: string = environment.api.base_url;
  showPayment: boolean = false;
  CanadianProvincesAndTerritories: any = [];
  autocompleteInput: string = '';
  disabledDays: number[] = [];
  queryWait: boolean = false;
  workingDays: Date[] = [];
  timeSlots: any = [];
  cardLogoImg: any;
  month: Array<{ key: string, value: string }> = [];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  years: Array<any> = []
  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  constructor(
    private ApiService: ApiService,
    private fb: FormBuilder,
    private toaster: UiToasterService,
    private cdr: ChangeDetectorRef,
    public contextService: ContextService,
    private cardPipe: CardNumberPipe,
    private router: Router
  ) {
    super();
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
  }

  async ngOnInit() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      pinCode: ['', Validators.required],
      address: ['', Validators.required],
      locality: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      landmark: [''],
      altPhoneNumber: ['', Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      defaultAddress: [false]
    });
    this.month = [];
    this.months.forEach((key, index) => {
      this.month.push({ key: `${index + 1}`, value: key })
    });
    this.storePickupForm = this.fb.group({
      selectedStore: ['', Validators.required],
      pickupDate: ['', Validators.required],
      pickupTime: ['']
    })
    this.deliveryForm = this.fb.group({
      deliveryAddress: ['', Validators.required],
      deliveryDate: [''],
      deliveryTime: ['']
    })
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      newEmail: ['', Validators.required],
      newPassword: ['', Validators.required],
    })
    this.ccForm = this.fb.group({
      holder_name: ['', [Validators.required]],
      card_number: ['', [Validators.required, Validators.pattern(/^(4|5)\d+/), Validators.maxLength(19), Validators.minLength(16)]],
      exp_month: ['', [Validators.required]],
      exp_year: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.maxLength(3), Validators.minLength(3)]],
    });
    Promise.all([
      this.fetchStates(),
      this.fetchAddres(),
      this.fetchStores(),
      this.getCart(),
      this.calculateSubTotal(),
    ])
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 20; i++) {
      this.years.push(i);
    }
  }

  async ngAfterViewInit() {
    this.stripe = await loadStripe('pk_test_51QCfgaLZHrsKgB4f6WCVMKuK5YpVd3SsUb9BNd4qJ0B9ycoK2BJdL4LTFWBp2dZMRptgaVRi86b76TaVlv8h5UiD00rTDU5Lbr');
    if (!this.stripe) {
      console.error('Stripe failed to load.');
      return;
    }

    const elements = this.stripe.elements(); // No more TS warning
    this.card = elements?.create('card', { hidePostalCode: true });
    this.card.mount('#card-element');

    console.log(this.contextService.user())
    if (!this.contextService.user()?.is_age_verified) {
      this.initSwal();
    }
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.cardPipe.transform(input.value);
    this.ccForm.get('card_number')!.setValue(formatted);
  }

  handlePlaceSelection(place: any) {
    if (!place) return;

    const addressComponents = place.address_components;
    let pinCode = '';
    let city = '';
    let state = '';
    let locality = '';

    addressComponents.forEach((component: any) => {
      const componentType = component.types[0];

      switch (componentType) {
        case 'postal_code':
          pinCode = component.long_name;
          break;
        case 'locality': // City
          city = component.long_name;
          break;
        case 'administrative_area_level_1': // State
          state = component.long_name;
          break;
        case 'sublocality_level_1': // Locality
        case 'neighborhood':
          locality = component.long_name;
          break;
      }
    });

    this.form.patchValue({
      address: place?.formatted_address || '',
      pinCode,
      city,
      locality
    });
  }

  initSwal() {
    Swal.fire({
      title: 'Confirm your age',
      text: `I am of legal drinking age in my province/territory of residence.`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      allowOutsideClick: false,  // Prevent clicking outside to close
      allowEscapeKey: false,  // Prevent Esc key from closing
      customClass: {
        confirmButton: 'btn btn-maroon rounded-5',
        cancelButton: 'btn btn-secondary rounded-5'
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const agePayload = {
          user_id: this.contextService.user()?.id,
          is_age_verified: true
        }
        await this.markAgeverified(agePayload);
      }
      if (!result.isConfirmed) {
        Swal.fire({
          title: 'Access Denied',
          html: `<span style="color: red; font-weight: bold;">
                  You cannot proceed due to not fulfilling the age requirement.
                 </span>`,
          icon: 'error',
          showConfirmButton: false,
          allowOutsideClick: false,  // Prevents closing when clicking outside
          allowEscapeKey: false  // Prevents closing on Escape key
        });
        setTimeout(() => {
          window.location.href = "https://www.google.com"; // Redirects instead
        }, 3000);
      }
    });

  }

  async fetchStores() {
    await this.ApiService.fetchStores().then((res) => {
      this.stores = res
    })
  }

  async fetchStates() {
    await this.ApiService.fetchStates().then((res) => {
      this.CanadianProvincesAndTerritories = res
    })
  }

  async getAddress(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Cast event target as HTMLSelectElement
    console.log('Selected State:', selectElement.value);
    // await this.fetchTaxes();
  }

  async fetchTaxes() {
    await this.ApiService.fetchTax(this.selectedState).then(async (res) => {
      this.tax_percentage = parseFloat(res[0]?.total_tax);
      if (this.activeTab != 1)
        await this.calculateShipping();
    })
    await this.calculateSubTotal();
  }

  async fetchAddres() {
    return await this.ApiService.fetchAddress().then((res) => {
      this.addresses = res;
      if (!(this.addresses.length > 0)) {
        this.showAddressForm = true;
      }
      console.log(this.addresses)
    })
  }

  async getCart() {
    await this.ApiService.getCartProducts().then((res) => {
      this.contextService.cart.set(res)
      this.cdr.detectChanges();
    })
  }

  async markAgeverified(data: any) {
    await this.ApiService.markAgeVerified(data).then((res) => {

      this.contextService.user.set(res?.user);
      localStorage.setItem('user', JSON.stringify(res?.user));
    })
  }

  async setAddress(event: any, directId?: any) {
    if (directId) {
      this.selectedState = directId;
    } else {
      const selectElement = event.target as HTMLSelectElement; // Cast event target as HTMLSelectElement
      this.selectedState = selectElement.value; // Get the selected value
      console.log('Selected State:', this.selectedState);
    }
    await this.fetchTaxes();
    this.form.reset();
    this.showAddressForm = false;
    if (this.storePickupForm.get('selectedStore').value) {
      const selectedStore = this.stores.data.data.find((store: any) => store.id == this.storePickupForm.get('selectedStore').value);
      if (selectedStore) {
        this.getNextWorkingDays(selectedStore.days, selectedStore.opening_time, selectedStore.closing_time);
      }
    }
  }

  private getNextWorkingDays(availableDays: any, openingTime: any, closingTime: any) {
    const weekdaysMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const availableDaysArray = availableDays.split(',')
      .map((day: any) => weekdaysMap[day.trim()]);

    const workingDates: Date[] = [];
    let currentDate = new Date();

    while (workingDates.length < 5) {
      if (availableDaysArray.includes(currentDate.getDay())) {
        workingDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.workingDays = workingDates;

    function generateTimeSlots(openingTime: string, closingTime: string) {
      const slots = [];
      let [startHour, startMinute] = openingTime.split(":").map(Number);
      let [endHour, endMinute] = closingTime.split(":").map(Number);
      while (
        startHour < endHour ||
        (startHour === endHour && startMinute <= endMinute)
      ) {
        const period = startHour >= 12 ? "PM" : "AM";
        const hour12 = startHour % 12 || 12;
        const formattedTime = `${hour12}:${startMinute
          .toString()
          .padStart(2, "0")} ${period}`;
        slots.push(formattedTime);
        startHour += 1;
        if (startHour === 24) break;
      }
      return slots;
    }

    this.timeSlots = generateTimeSlots(openingTime, closingTime);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  async setActiveTab(tabNumber: number) {
    this.activeTab = tabNumber;
    console.log('Active Tab Number:', this.activeTab); // Optional for debugging
    this.selectedTime = null;
    this.storePickupForm.reset();
    this.deliveryForm.reset();
    this.shippingForm.reset();
    this.total_tax = 0;
    this.total = 0;
    this.shippingCharges = 0;
    await this.calculateSubTotal();
  }

  triggerClick(inputElement: HTMLInputElement) {
    inputElement.showPicker(); // Triggers the native date/time picker
  }

  async onSubmitAddress() {
    if (this.form.valid) {
      const value = {
        full_name: this.form.value.fullName,
        mobile_number: this.form.value.mobileNumber,
        pin_code: this.form.value.pinCode,
        address: this.form.value.address,
        locality: this.form.value.locality,
        city: this.form.value.city,
        state_id: this.form.value.state,
        landmark: this.form.value.landmark,
        alternate_phone_number: this.form.value.altPhoneNumber,
        is_default: this.form.value.defaultAddress ? 1 : 0
      }
      await this.ApiService.saveAddress(value).then(async (res) => {
        this.toaster.Success('Address Added Successfully');
        await this.fetchAddres();
        return res;
      })
    } else { this.validateForm(); }

  }

  calculateSubTotal() {
    let itemsTotal: any = 0;
    this.contextService.cart()?.data?.map((item: any) => {
      itemsTotal += item?.quantity * item?.product?.price
    })
    this.subTotal = itemsTotal;
    this.total_tax = (this.tax_percentage / 100) * parseFloat(itemsTotal);
    this.total = itemsTotal + this.total_tax;
    return itemsTotal
  }

  async calculateShipping() {
    try {
      let address = this.addresses.find((item: any) => item?.id === this.deliveryForm.get('deliveryAddress')?.value) ||
        this.addresses.find((item: any) => item?.id === this.shippingForm.get('shippingAddress')?.value);

      const count = this.contextService.cart()?.data?.reduce((sum: any, item: any) => sum + (item.quantity ?? 0), 0) || 0;
      const body = {
        serviceCode: "GE",
        address: {
          address1: address?.address,
          address2: null,
          city: address?.city,
          province: address?.state?.NAME || address?.state_name,
          postalCode: address?.pin_code,
          country: "Canada",
          isResidential: false, // Ensure this key is correctly spelled
        },
        pieces: count,
        packages: [],
        totalWeight: 1 * count,
        isPallet: false, // Corrected syntax
        shipDate: this.deliveryForm.value.deliveryDate instanceof Date
          ? this.deliveryForm.value.deliveryDate.toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        shipmentTypeEnum: "regular",
        selectedAccessorials: [],
        declaredValue: this.subTotal,
      };
      const result: any = await this.ApiService.getShippingCharges(body);
      debugger;
      console.log('Response:', result);
      if (result.error) { this.toaster.Warning('Please add valid proper Address') }
      this.shippingCharges = result?.total ? result.total : result;
      this.total = this.total + this.shippingCharges;
      return result?.total;

    } catch (error) {
      console.error('Error fetching shipping charges:', error);
      return undefined; // Avoid breaking the UI
    }
  }

  async placeOrder() {
    if ((this.contextService.user()?.is_guest === true || this.contextService.user()?.is_guest === '1')) {
      if (this.signUpForm.valid) {
        await this.onSignUp();
      } else {
        return this.validateForm(this.signUpForm);
      }
    }
    switch (this.activeTab) {
      case 1:
        if (this.storePickupForm.valid) {
          const timestamp = this.storePickupForm.value.pickupDate;
          const dateOnly = new Date(timestamp).toISOString().split('T')[0];
          const storePickupPayload = {
            user_id: this.contextService.user()?.id,
            items: this.contextService.cart()?.data?.map((product: any) => {
              return { product_id: product?.product?.id, name: product?.product?.name, quantity: product?.quantity, price: product?.product?.price }
            }),
            total_amount: this.subTotal,
            payment_method: 'stripe',
            delivery_type: "store",
            pickup_date: dateOnly,
            pickup_time: this.storePickupForm.value.pickupTime,
            delivery_time: this.storePickupForm.value.pickupTime,
            store: this.storePickupForm.value.selectedStore,
            total_tax: this.total_tax,
          }
          console.log(JSON.stringify(storePickupPayload))
          await this.ApiService.placeOrder(storePickupPayload).then(async (res) => {
            if (!this.card) {
              alert('Card Element is not initialized');
              return;
            }
            const { error, paymentIntent }: any = await this?.stripe?.confirmCardPayment(res?.client_secret, {
              payment_method: {
                card: this.card,
                billing_details: {
                  name: 'John Doe',
                  email: 'john@example.com',
                },
              },
            });

            if (error) {
              console.error('Payment authorization failed:', error.message);
              this.toaster.Error(error.message);
            } else if (paymentIntent?.status === 'requires_capture') {
              console.log('Payment authorized, pending capture.');
              this.toaster.Success('Payment authorized successfully.');
              this.router.navigate(['/order-confirmation'], { queryParams: { order_id: res?.order?.id } });
              // optionally call backend to notify
            }
          })
        } else {
          this.validateForm(this.storePickupForm)
        }
        break;
      case 2:
        debugger;
        if (!this.deliveryForm.get('deliveryAddress')?.value && this.showAddressForm) {
          debugger;
          let address_added = null;
          if (this.form.valid) {
            const value = {
              full_name: this.form.value.fullName,
              mobile_number: this.form.value.mobileNumber,
              pin_code: this.form.value.pinCode,
              address: this.form.value.address,
              locality: this.form.value.locality,
              city: this.form.value.city,
              state_id: this.form.value.state,
              landmark: this.form.value.landmark,
              alternate_phone_number: this.form.value.altPhoneNumber,
              is_default: this.form.value.defaultAddress ? 1 : 0
            }
            address_added = await this.ApiService.saveAddress(value)
          } else { this.validateForm(); }
          this.deliveryForm.patchValue({
            deliveryAddress: address_added?.data.id
          })
          await this.fetchAddres();
          await this.setAddress(event, address_added?.data.state_id).then(async (res) => {
            if (this.shippingCharges > 0) {
              const localDeliveryPayload = {
                user_id: this.contextService.user()?.id,
                items: this.contextService.cart()?.data?.map((product: any) => {
                  return {
                    product_id: product?.product?.id,
                    name: product?.product?.name,
                    quantity: product?.quantity,
                    price: product?.product?.price
                  };
                }),
                total_amount: this.subTotal,
                delivery_address: this.formatAddress(this.addresses.find((item: any) => item?.id === this.deliveryForm.get('deliveryAddress')?.value)),
                payment_method: 'stripe',
                delivery_type: "local",
                pickup_date: this.deliveryForm.value.deliveryDate,
                delivery_time: this.selectedTime,
                total_tax: this.total_tax,
                shipping_charge: this.shippingCharges
              };
              await this.ApiService.placeOrder(localDeliveryPayload).then(async (res) => {
                if (!this.card) {
                  alert('Card Element is not initialized');
                  return;
                }
                const { error, paymentIntent }: any = await this?.stripe?.confirmCardPayment(res?.client_secret, {
                  payment_method: {
                    card: this.card,
                    billing_details: {
                      name: 'John Doe',
                      email: 'john@example.com',
                    },
                  },
                });
  
                if (error) {
                  console.error('Payment authorization failed:', error.message);
                  this.toaster.Warning(error.message);
                } else if (paymentIntent?.status === 'requires_capture') {
                  console.log('Payment authorized, pending capture.');
                  this.toaster.Success('Payment authorized successfully.');
                  this.router.navigate(['/order-confirmation'], { queryParams: { order_id: res?.order?.id } });
                  // optionally call backend to notify
                }
              })
            } else {
              this.validateForm(this.deliveryForm);
              if (!this.shippingCharges && this.deliveryForm.valid) {
                this.toaster.Warning('Please try again after some time.')
              }
            }
          })
        } else {
          if (this.deliveryForm.valid && Number(this.shippingCharges) > 0) {
            const localDeliveryPayload = {
              user_id: this.contextService.user()?.id,
              items: this.contextService.cart()?.data?.map((product: any) => {
                return {
                  product_id: product?.product?.id,
                  name: product?.product?.name,
                  quantity: product?.quantity,
                  price: product?.product?.price
                };
              }),
              total_amount: this.subTotal,
              delivery_address: this.formatAddress(this.addresses.find((item: any) => item?.id === this.deliveryForm.get('deliveryAddress')?.value)),
              payment_method: 'stripe',
              delivery_type: "local",
              pickup_date: this.deliveryForm.value.deliveryDate,
              delivery_time: this.selectedTime,
              total_tax: this.total_tax,
              shipping_charge: this.shippingCharges,
            };
            console.log(JSON.stringify(localDeliveryPayload))
            await this.ApiService.placeOrder(localDeliveryPayload).then(async (res) => {
              if (!this.card) {
                alert('Card Element is not initialized');
                return;
              }
              const { error, paymentIntent }: any = await this?.stripe?.confirmCardPayment(res?.client_secret, {
                payment_method: {
                  card: this.card,
                  billing_details: {
                    name: 'John Doe',
                    email: 'john@example.com',
                  },
                },
              });

              if (error) {
                console.error('Payment authorization failed:', error.message);
                this.toaster.Warning(error.message);
              } else if (paymentIntent?.status === 'requires_capture') {
                console.log('Payment authorized, pending capture.');
                this.toaster.Success('Payment authorized successfully.');
                this.router.navigate(['/order-confirmation'], { queryParams: { order_id: res?.order?.id } });
                // optionally call backend to notify
              }
            })
          } else {
            this.validateForm(this.deliveryForm);
            if (!this.shippingCharges && this.deliveryForm.valid) {
              this.toaster.Warning('Please try again after some time.')
            }
          }
        }
        break;
      default:
        break;
    }
  }

  extractBasicAddress(fullAddress: any) {
    // Split by comma and take the first part
    const parts = fullAddress.split(',');
    return parts[0].trim();
  }



  formatAddress(address: any) {
    if (!address) return null; // Handle case where no address is provided

    const { full_name, address: addr, locality, landmark, city, state, pin_code, mobile_number } = address;
    const count = this.contextService.cart()?.data?.reduce((sum: any, item: any) => sum + (item.quantity ?? 0), 0) || 0;
    // return {
    //   name: full_name || '',
    //   address: `${addr || ''}, ${locality || ''}${landmark ? ', ' + landmark : ''}, ${city || ''} - ${pin_code || ''}, ${state || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim(),
    //   mobile: mobile_number || '' 
    // };
    debugger;
    return {
      docketCode: "LIQUOR",
      address: {
        name: full_name,
        attentionTo: null,
        address1: this.extractBasicAddress(addr),
        address2: null,
        city: city,
        province: state?.CODE,
        country: "CA",
        postalCode: pin_code,
        isResidential: false
      },
      phone: mobile_number,
      ServiceCode: "G9",
      totalWeight: 1 * count,
      Pieces: count,
      ShipDate: new Date(new Date().setDate(new Date().getDate() + 1))
    }
  }

  formatTime(form: FormGroup, field: string) {
    const timeValue = form.get(field)?.value; // Get the raw value
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':');
      let hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12; // Convert to 12-hour format
      const formattedHour = String(hour).padStart(2, '0'); // Add leading zero if necessary
      const formattedMinutes = String(minutes).padStart(2, '0'); // Add leading zero if necessary
      const formattedTime = `${formattedHour}:${formattedMinutes} ${ampm}`; // Format the time
      this.selectedTime = formattedTime // Dynamically set the field value
    }
  }

  continue() {
    this.showPayment = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async onSignUp() {
    if (this.signUpForm.invalid) {
      this.validateForm();
    } else {
      const payload = {
        name: this.signUpForm.value?.firstName + ' ' + this.signUpForm.value?.lastName,
        first_name: this.signUpForm.value.firstName,
        last_name: this.signUpForm.value.lastName,
        email: this.signUpForm.value.newEmail,
        password: this.signUpForm.value.newPassword,
        is_guest: 0
      }
      await this.ApiService.updateUser(payload).then(res => {
        this.contextService.user.set(res?.user);
        localStorage.setItem('user_id', res?.user?.id);
        localStorage.setItem('user', JSON.stringify(res?.user));
      })
    }
  }


  handleKeyPressName(e: any) {
    var x = e.which || e.keyCode;
    if ((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || x === 32) {
      return true;
    }
    return false;
  }

  disablePaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  cardLogo(e: any) {
    let firstLetter = this.ccForm.value.card_number.slice(0, 2);
    switch (firstLetter) {
      case "34":
      case "37":
        this.cardLogoImg = 'assets/images/credit_card/amex.svg';
        break;
      case "40":
      case "41":
      case "42":
      case "43":
      case "44":
      case "45":
      case "46":
      case "47":
      case "48":
      case "49":
        this.cardLogoImg = 'assets/images/credit_card/visa.svg';
        break;
      case "51":
      case "52":
      case "53":
      case "54":
      case "55":
        this.cardLogoImg = 'assets/images/credit_card/mastercard.svg';
        break;
      case "36":
      case "38":
      case "30":
        this.cardLogoImg = 'assets/images/credit_card/diners.svg';
        break;
      case "60":
        this.cardLogoImg = 'assets/images/credit_card/discover.svg';
        break;
      case "18":
      case "21":
      case "30":
      case "32":
      case "33":
      case "35":
        this.cardLogoImg = 'assets/images/credit_card/jcb.svg';
        break;
      default:
        this.cardLogoImg = null;
        break;
    }
  }

  handleKeyPress(e: any) {
    var x = e.which || e.keyCode;
    if (x > 64 && x < 91 || x > 96 && x < 123 || (x >= 33 && x <= 47) || (x >= 58 && x <= 64) || (x >= 91 && x <= 96) || (x >= 123 && x <= 126)) {
      return false;
    }

    this.cardNumberInput();
    return true;
  }

  cvvInput(e: any) {
    var x = e.which || e.keyCode;
    if (x > 64 && x < 91 || x > 96 && x < 123 || (x >= 33 && x <= 47) || (x >= 58 && x <= 64) || (x >= 91 && x <= 96) || (x >= 123 && x <= 126)) {
      return false;
    }

    this.ccForm.get('cvv')?.valueChanges.subscribe((value: any) => {
      if (value.length > 3) {
        value = value.slice(0, 3);
        this.ccForm.get('cvv')?.setValue(value);
      }
    });
    return true
  }

  cardNumberInput() {
    this.ccForm.get('card_number')?.valueChanges.subscribe((value: any) => {
      if (value.length > 19) {
        value = value.slice(0, 19);
        this.ccForm.get('card_number')?.setValue(value);
      }
    });
  }


  showAddressFormFunc() {
    this.showAddressForm = true;
    this.deliveryForm.patchValue({
      deliveryAddress: ''
    })
  }

}





