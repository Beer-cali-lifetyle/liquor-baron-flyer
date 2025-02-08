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
  storePickupForm!: any;
  deliveryForm!: any;
  shippingForm!: any;
  selectedTime: any;
  @ViewChild('modalContent') modalContent: TemplateRef<any> | undefined;
  selectedBillingAddress: any;
  selectedPaymentMethod: any = 'online';
  imgBaseUrl: string = environment.api.base_url;
  showPayment: boolean = false;
  CanadianProvincesAndTerritories: any = [];
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
  queryWait: boolean = false;
  constructor(
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
    this.selectedLocation = place;
    this.form.patchValue({
      address: place?.formatted_address
    })
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
    await this.fetchStates();
    await this.fetchAddres();
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
    await this.fetchStores();
    await this.getCart();
    await this.calculateSubTotal();
  }

  ngAfterViewInit() {
    this.initSwal();
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
    }).then((result) => {
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

  async getAddress(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Cast event target as HTMLSelectElement
    console.log('Selected State:', selectElement.value);
    // await this.fetchTaxes();
  }

  async setAddress(event: Event, directId?: any) {
    if (directId) {
      this.selectedState = directId
    } else {
      const selectElement = event.target as HTMLSelectElement; // Cast event target as HTMLSelectElement
      this.selectedState = selectElement.value; // Get the selected value
      console.log('Selected State:', this.selectedState);
    }
    await this.fetchTaxes();
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
      this.tax_percentage = parseFloat(res[0]?.total_tax)
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

  async placeOrder() {
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
            store: this.storePickupForm.value.selectedStore
          }
          console.log(JSON.stringify(storePickupPayload))
          await this.ApiService.placeOrder(storePickupPayload).then((res) => {
            const checkoutUrl = res?.checkout_url;
            if (checkoutUrl) {
              // Redirect to the checkout URL
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
        if (this.deliveryForm.valid) {
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
          };
          console.log(JSON.stringify(localDeliveryPayload))
          await this.ApiService.placeOrder(localDeliveryPayload).then((res) => {
            const checkoutUrl = res?.checkout_url;
            if (checkoutUrl) {
              // Redirect to the checkout URL
              window.location.href = checkoutUrl;
            } else {
              console.error('Checkout URL not found');
            }
          })
        } else {
          this.validateForm(this.deliveryForm)
        }
        break;
      case 3:
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

}
