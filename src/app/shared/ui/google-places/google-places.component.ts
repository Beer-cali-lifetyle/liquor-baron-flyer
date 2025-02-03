import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const google: any; // Declare google object to avoid TypeScript errors

@Component({
  selector: 'app-google-places-autocomplete',
  standalone: true,
  imports: [CommonModule],
  template: ` <label class="form-label">Address</label><input #searchInput type="text" class="form-control" placeholder="Enter a location" />`,
  styles: [
    `
      .form-control {
        width: 100%;
        padding: 10px;
        font-size: 14px;
        border-radius: 7px;
        border: 1px solid #ccc;
      }
    `,
  ],
})
export class GooglePlacesAutocompleteComponent implements OnInit {
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  @Output() locationSelected = new EventEmitter<any>();

  private autocomplete!: any;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadGoogleMaps().then(() => this.initializeAutocomplete());
  }

  private async loadGoogleMaps(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return; // Google Maps API is already loaded
    }

    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFtrosISezP-8z2NwTWKhD_5pNHoi0wRw&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private initializeAutocomplete(): void {
    this.autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement, {
      types: ['geocode'],
    });

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete.getPlace();
        this.locationSelected.emit(place?.geometry ? place : null);
      });
    });
  }
}
