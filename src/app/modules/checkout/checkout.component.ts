import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, ElementRef, NgZone, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { NgbModal, NgbNavModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppBase } from '../../../app-base.component';
import { UiToasterService } from '../../core/services/toaster.service';
import { ContextService } from '../../core/services/context.service';
import { environment } from '../../../environments/environment';
import { PaymentComponent } from "../payment/payment.component";
import { GooglePlacesAutocompleteDirective } from '../../core/directives/google-places.directive';
import { GooglePlacesAutocompleteComponent } from '../../shared/ui/google-places/google-places.component';
import Swal from 'sweetalert2';
import { catchError, firstValueFrom, Observable, throwError, timeout } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
// declare const google: any;
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NgbNavModule,
    PaymentComponent, PaymentComponent, GooglePlacesAutocompleteComponent
  ]
})
export class CheckoutComponent extends AppBase implements OnInit, AfterViewInit {
  selectedLocation: any = null;
  total_tax = 0;
  public searchElementRef!: ElementRef;
  tax_percentage = 0;
  subTotal = 0;
  total = 0;
  selectedState: any = '5297c752-eaae-4e66-992e-fefd6f3ba2d4';
  activeTab = 1;
  addresses: any = [];
  stores: any = [];
  signUpForm!: any;
  storePickupForm!: any;
  deliveryForm!: any;
  shippingForm!: any;
  selectedTime: any;
  shippingCharges: number = 0;
  @ViewChild('modalContent') modalContent: TemplateRef<any> | undefined;
  selectedBillingAddress: any;
  selectedPaymentMethod: any = 'online';
  imgBaseUrl: string = environment.api.base_url;
  showPayment: boolean = false;
  CanadianProvincesAndTerritories: any = [];
  private shippingApiUrl = 'https://admin.liquorbaronflyer.ca/api/shipping/rate';
  // private shippingApiUrl = 'https://atsapi-dev.azurewebsites.net/v1/Shipments/rate';
  // USStates = [
  //   "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  //   "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana",
  //   "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  //   "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  //   "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
  //   "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  //   "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  //   "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  // ];
  autocompleteInput: string = '';
  disabledDays: number[] = [];
  queryWait: boolean = false;
  constructor(
    private http: HttpClient,
    private ApiService: ApiService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private toaster: UiToasterService,
    private cdr: ChangeDetectorRef,
    public contextService: ContextService,
    // private googleMapsService: GoogleMapsService
  ) {
    super();
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
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

  async ngOnInit() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      pinCode: ['', Validators.required],
      address: ['', Validators.required],
      locality: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      landmark: [''],
      altPhoneNumber: ['', Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      defaultAddress: [false]
    });
    this.storePickupForm = this.fb.group({
      selectedStore: ['', Validators.required],
      pickupDate: ['', Validators.required],
      pickupTime: ['']
    })
    this.deliveryForm = this.fb.group({
      deliveryAddress: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      deliveryTime: ['']
    })
    this.shippingForm = this.fb.group({
      shippingAddress: ['', Validators.required],
    })
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      newEmail: ['', Validators.required],
      newPassword: ['', Validators.required],
    })
    Promise.all([
      this.fetchStates(),
      this.fetchAddres(),
      this.fetchStores(),
      this.getCart(),
      this.calculateSubTotal(),
    ])
  }

  ngAfterViewInit() {
    console.log(this.contextService.user())
    if (!this.contextService.user()?.is_age_verified) {
      this.initSwal();
    }
    // this.googleMapsService
    //   .loadGoogleMaps('AIzaSyBFtrosISezP-8z2NwTWKhD_5pNHoi0wRw')
    //   .then(() => {
    //     const inputElement = this.addressInput.nativeElement;
    //     const autocomplete = new google.maps.places.Autocomplete(inputElement, {
    //       types: ['address'],
    //     });

    //     autocomplete.addListener('place_changed', () => {
    //       const place = autocomplete.getPlace();
    //       console.log(place);
    //     });
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
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
      }
    });

  }

  async markAgeverified(data: any) {
    await this.ApiService.markAgeVerified(data).then((res) => {

      this.contextService.user.set(res?.user);
      localStorage.setItem('user', JSON.stringify(res?.user));
    })
  }

  async getAddress(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Cast event target as HTMLSelectElement
    console.log('Selected State:', selectElement.value);
    // await this.fetchTaxes();
  }

  async setAddress(event: Event, directId?: any) {
    if (this.activeTab === 2 && !(this.deliveryForm.value.deliveryDate)) {
      this.toaster.Warning('Please Select delivery date first')
      this.deliveryForm.get('deliveryAddress')?.setValue(null);
      event.preventDefault;
      event.stopPropagation();
      return
    }
    if (directId) {
      this.selectedState = directId;
    } else {
      const selectElement = event.target as HTMLSelectElement; // Cast event target as HTMLSelectElement
      this.selectedState = selectElement.value; // Get the selected value
      console.log('Selected State:', this.selectedState);
    }
    await this.fetchTaxes();
    if (this.storePickupForm.get('selectedStore').value) {
      const selectedStore = this.stores.data.data.find((store: any) => store.id == this.storePickupForm.get('selectedStore').value);
      if (selectedStore) {
        this.setDisabledDays(selectedStore.days);
      }
    }
  }

  setDisabledDays(availableDays: string) {
    const weekdaysMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const availableDaysArray = availableDays.split(',').map(day => weekdaysMap[day.trim()]);
    this.disabledDays = Array.from({ length: 7 }, (_, i) => i).filter(day => !availableDaysArray.includes(day));
  }

  // Validate selected date and clear if it's a disabled day
  validateDate(event: any) {
    const weekdaysMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    if (!this.storePickupForm.get('selectedStore').value) {
      this.toaster.Warning('Select store first.')
    }
    debugger;
    const selectedDate = new Date(event.target.value);
    if (this.disabledDays.includes(selectedDate.getDay())) {
      this.toaster.Warning(`Store is not open on these days: ${this.disabledDays.map(day => Object.keys(weekdaysMap).find(key => weekdaysMap[key] === day)).join(', ')}.`);

      this.storePickupForm.get('pickupDate')?.setValue('');
    }
  }

  openModal(content: any) {
    const modalRef: NgbModalRef = this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
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

  triggerClick(inputElement: HTMLInputElement) {
    inputElement.showPicker(); // Triggers the native date/time picker
  }

  async fetchTaxes() {
    await this.ApiService.fetchTax(this.selectedState).then((res) => {
      this.tax_percentage = parseFloat(res[0]?.total_tax);
      if (this.activeTab != 1)
        this.calculateShipping();
    })
    await this.calculateSubTotal();
  }

  async fetchAddres() {
    await this.ApiService.fetchAddress().then((res) => {
      this.addresses = res;
      console.log(this.addresses)
    })
  }

  async getCart() {
    await this.ApiService.getCartProducts().then((res) => {
      this.contextService.cart.set(res)
      this.cdr.detectChanges();
    })
  }

  openModalToAdd() {
    this.modalService.open(this.modalContent, { centered: true, backdrop: 'static', keyboard: false, size: 'lg' });
  }

  closeModal() {
    this.form.reset();
    this.modalService.dismissAll()
  }

  async onSubmit() {
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
      })
      await this.fetchAddres()
      this.closeModal();
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

  // async calculateShipping() {
  //   try {
  //     const headers = new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkJCT2pNMGZTNTBhdHVyVHBqMUpPbyJ9.eyJvcmdhbml6YXRpb25JZCI6IjUxIiwiYWNjb3VudElkIjoiNTIiLCJhcHBfZ3JvdXBzIjpbIldpbmVTaGlwcGVyX0N1c3RvbWVyX1NoaXBwZXIiXSwiY2lkIjoiWk5kTDdHQzNHMm5RSkJURlkxbTlYa1lHRm04cll2bUMiLCJpc3MiOiJodHRwczovL2xvZ2luLWIyYi1hdHMtaGVhbHRoY2FyZS51cy5hdXRoMC5jb20vIiwic3ViIjoiWk5kTDdHQzNHMm5RSkJURlkxbTlYa1lHRm04cll2bUNAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vdGVzdC5hcGkuYXRzLmhlYWx0aGNhcmUiLCJpYXQiOjE3NDE2MzMyNTksImV4cCI6MTc0MTcxOTY1OSwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiWk5kTDdHQzNHMm5RSkJURlkxbTlYa1lHRm04cll2bUMifQ.C1V5Nt-KZbkxopTttn1XM08vSy2zWNKKwztTW0yyP2IN8vNi9GxJIlkmbJDijjlKm3x1QY_x7rAv72yrx2sJsq3m9V-bFZhCkPGcz_rfv5YDcoIrpZaHggiMIgKTZtMXXb82_NR5TUb2nfy05A0CsKQJGp8uig1JSWAwKbhKU8rJTZRw8BDbPVhg0pSsWp9Xn14yTSw6i7fdtPHd2dPLC9Lli8m8fRdalIjJgnZ03fLbH_3PfVn8eV-5kgHhC3peZmTgYGVO-fEXj1GKijT3QRT2mKbEtvDIGGs_ks_O7RCiJ4hyVgRVzuyMo5DeitmqG9iSajJVCWiY2nsXQlEXvg`
  //     });

  //     let address = this.addresses.find((item: any) => item?.id === this.deliveryForm.get('deliveryAddress')?.value) ||
  //                   this.addresses.find((item: any) => item?.id === this.shippingForm.get('shippingddress')?.value);

  //     const count = this.contextService.cart()?.data?.reduce((sum: any, item: any) => sum + (item.quantity ?? 0), 0) || 0;

  //     const body = {
  //       "serviceCode": "GE",
  //       "address": {
  //         "address1": address?.address,
  //         "address2": address?.locality,
  //         "city": address?.city,
  //         "province": address?.state?.NAME || address?.state_name,
  //         "postalCode": address?.pin_code,
  //         "country": "Canada",
  //         "isResidential": false
  //       },
  //       "pieces": count,
  //       "packages": [],
  //       "totalWeight": 1.5 * count,
  //       "isPallet": false,
  //       "shipDate": this.deliveryForm.value.deliveryDate,
  //       "shipmentTypeEnum": "regular",
  //       "selectedAccessorials": [],
  //       "declaredValue": 100.00
  //     };

  //     console.log('Request Payload:', JSON.stringify(body));

  //     const result: any = await firstValueFrom(
  //       this.http.post(this.shippingApiUrl, body, { headers }).pipe(
  //         timeout(15000), // 15 seconds timeout
  //         catchError(err => {
  //           console.error('Request failed:', err);
  //           return throwError(() => err);
  //         })
  //       )
  //     );

  //     console.log('Response:', result);

  //     this.shippingCharges = result?.total ? result.total : result;
  //     this.total  = this.total + this.shippingCharges;
  //     return result?.total;

  //   } catch (error) {
  //     console.error('Error fetching shipping charges:', error);
  //     return undefined; // Avoid breaking the UI
  //   }
  // }

  async getAuthToken() {
    const tokenData = localStorage.getItem('ats_token');

    if (tokenData) {
      const tokenObj = JSON.parse(tokenData);
      const decoded: any = jwtDecode(tokenObj.access_token);

      // Check if token is expired
      if (decoded.exp * 1000 > Date.now()) {
        return tokenObj.access_token;
      }
    }

    // Fetch new token if not found or expired
    const body = {
      "client_id": "ZNdL7GC3G2nQJBTFY1m9XkYGFm8rYvmC",
      "client_secret": "0fw-N811uBmlGS6wyioOKM4-a2OqrFachUpfVcJUT3LiUf33EBgUeTbgbO61QXbA",
      "audience": "https://test.api.ats.healthcare",
      "grant_type": "client_credentials"
    };

    try {
      const result: any = await firstValueFrom(
        this.http.post('https://admin.liquorbaronflyer.ca/api/stripe/token', body, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        })
      );

      if (result.access_token) {
        localStorage.setItem('ats_token', JSON.stringify(result));
        return result.access_token;
      }

      throw new Error('Failed to retrieve token');
    } catch (error) {
      console.error('Token Fetch Error:', error);
      throw error;
    }
  }

  async calculateShipping() {
    try {
      let address = this.addresses.find((item: any) => item?.id === this.deliveryForm.get('deliveryAddress')?.value) ||
        this.addresses.find((item: any) => item?.id === this.shippingForm.get('shippingAddress')?.value);

      const count = this.contextService.cart()?.data?.reduce((sum: any, item: any) => sum + (item.quantity ?? 0), 0) || 0;
      // const token = await this.getAuthToken();
      // const headers = new HttpHeaders({
      //   'Content-Type': 'application/json',
      //   'Authorization': `Bearer ${token}`
      // });
      // debugger;
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
        totalWeight: 1.5 * count,
        isPallet: false, // Corrected syntax
        shipDate: this.deliveryForm.value.deliveryDate instanceof Date
          ? this.deliveryForm.value.deliveryDate.toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        shipmentTypeEnum: "regular",
        selectedAccessorials: [],
        declaredValue: this.subTotal,
      };
      const result: any = await this.ApiService.getShippingCharges(body);
      // const result: any = await firstValueFrom(
      //             this.http.post(this.shippingApiUrl, body, { headers }).pipe(
      //               catchError(err => {
      //                 console.error('Request failed:', err);
      //                 return throwError(() => err);
      //               })
      //             )
      //           );

      console.log('Response:', result);
      debugger;
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
      await this.onSignUp();
      debugger;
      console.log('hello')
    }
    debugger;
    switch (this.activeTab) {
      case 1:
        if (this.storePickupForm.valid) {
          const storePickupPayload = {
            user_id: this.contextService.user()?.id,
            items: this.contextService.cart()?.data?.map((product: any) => {
              return { product_id: product?.product?.id, name: product?.product?.name, quantity: product?.quantity, price: product?.product?.price }
            }),
            total_amount: this.subTotal,
            payment_method: this.selectedPaymentMethod,
            delivery_type: "store",
            pickup_date: this.storePickupForm.value.pickupDate,
            delivery_time: this.selectedTime,
            store: this.storePickupForm.value.selectedStore,
            total_tax: this.total_tax,
          }
          console.log(JSON.stringify(storePickupPayload))
          await this.ApiService.placeOrder(storePickupPayload).then((res) => {
            const checkoutUrl = res?.checkout_url;
            if (checkoutUrl) {
              window.location.href = checkoutUrl;
            } else {
              console.error('Checkout URL not found');
            }
          })
        } else {
          this.validateForm(this.storePickupForm)
        }
        break;
      case 2:
        if (this.deliveryForm.valid && this.shippingCharges > 0) {
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
            payment_method: this.selectedPaymentMethod,
            delivery_type: "local",
            pickup_date: this.deliveryForm.value.deliveryDate,
            delivery_time: this.selectedTime,
            total_tax: this.total_tax,
            shipping_charge: this.shippingCharges
          };
          console.log(JSON.stringify(localDeliveryPayload))
          await this.ApiService.placeOrder(localDeliveryPayload).then((res) => {
            debugger;
            console.log(res)
            const checkoutUrl = res?.checkout_url;
            if (checkoutUrl) {
              // Redirect to the checkout URL
              window.location.href = checkoutUrl;
            } else {
              console.error('Checkout URL not found');
            }
          })
        } else {
          this.validateForm(this.deliveryForm);
          if (!this.shippingCharges && this.deliveryForm.valid) {
            this.toaster.Warning('Please try again after some time.')
          }
        }
        break;
      case 3:
        if (this.shippingForm.get('shippingAddress')?.value && this.shippingCharges > 0) {
          const shippingPayload = {
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
            delivery_address: this.formatAddress(this.addresses.find((item: any) => item?.id === this.shippingForm.get('shippingAddress')?.value)),
            payment_method: this.selectedPaymentMethod,
            delivery_type: "shipping",
            total_tax: this.total_tax,
            shipping_charge: this.shippingCharges
          };
          await this.ApiService.placeOrder(shippingPayload).then((res) => {
            const checkoutUrl = res?.checkout_url;
            if (checkoutUrl) {
              // Redirect to the checkout URL
              window.location.href = checkoutUrl;
            } else {
              console.error('Checkout URL not found');
            }
          })
        } else {
          this.validateForm(this.shippingForm);
          if (!this.shippingCharges && this.shippingForm.valid) {
            this.toaster.Warning('Please try again after some time.')
          }
        }
        break;
      default:
        break;
    }
  }


  formatAddress(address: any) {
    if (!address) return null; // Handle case where no address is provided

    const { full_name, address: addr, locality, landmark, city, state, pin_code, mobile_number } = address;

    return {
      name: full_name || '', // Full name
      address: `${addr || ''}, ${locality || ''}${landmark ? ', ' + landmark : ''}, ${city || ''} - ${pin_code || ''}, ${state || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim(),
      mobile: mobile_number || '' // Mobile number (optional if required)
    };
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
      debugger;
      await this.ApiService.updateUser(payload).then(res => {
        this.contextService.user.set(res?.user);
        localStorage.setItem('user_id', res?.user?.id);
        localStorage.setItem('user', JSON.stringify(res?.user));
        this.toaster.Success('Updated successfully')
      })
    }
  }

}
