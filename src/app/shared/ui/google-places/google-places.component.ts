import {
  Component,
  ViewChild,
  EventEmitter,
  Output,
  OnInit,
  AfterViewInit,
  Input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'AutocompleteComponent',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input
      class="input"
      type="text"
      [(ngModel)]="autocompleteInput"
      #addresstext
      style="padding: 12px 20px; border: 1px solid #ccc; width: 400px"
      placeholder="Enter an address"
    />
  `,
})
export class AutocompleteComponent implements OnInit, AfterViewInit {
  @Input() adressType: string = 'address'; // Default type
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  @ViewChild('addresstext', { static: true }) addresstext: any;

  autocompleteInput: string = '';
  queryWait: boolean = false;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadGoogleMapsScript().then(() => {
      this.getPlaceAutocomplete();
    }).catch(error => {
      console.error('Error loading Google Maps script:', error);
    });
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps) {
        resolve(); // Already loaded
      } else {
        // Load Google Maps script dynamically
        debugger;
        const script = document.createElement('script');
        script.src =
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyB0ryr4C25ppfP_PZETJKuFEY0I3Izkt-0&loading=async&libraries=places';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (typeof google !== 'undefined') {
            resolve();
          } else {
            reject('Google Maps script loaded, but "google" object is not defined');
          }
        };
        script.onerror = (error: any) => reject(error);
        document.head.appendChild(script);
      }
    });
  }

  private getPlaceAutocomplete() {
    if (!this.addresstext || !this.addresstext.nativeElement) {
      console.error('Address input element not found');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(
      this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'CA' }, // Restrict to Canada
        types: [this.adressType], // Address type
      }
    );

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.invokeEvent(place);
    });
  }

  invokeEvent(place: Object) {
    this.setAddress.emit(place);
  }
}
