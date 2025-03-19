import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-google-places-autocomplete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="form-label flex-">Address <span class="text-danger">*</span></label>
    <input #searchInput type="text" class="form-control" [value]="address" placeholder="Enter a location" />
  `,
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
export class GooglePlacesAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  @Output() locationSelected = new EventEmitter<any>();
  @Input() address: string = '';

  private autocomplete!: any;
  private pacContainer!: HTMLElement | null;
  private scrollableParent!: HTMLElement | null;
  private scrollListener!: () => void;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadGoogleMaps().then(() => this.initializeAutocomplete());
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pacContainer = document.querySelector('.pac-container') as HTMLElement;
      if (this.pacContainer) {
        this.pacContainer.style.zIndex = '9999';
        this.pacContainer.style.position = 'absolute';
        document.body.appendChild(this.pacContainer);
        this.adjustDropdownPosition();
      }

      // Attach scroll listener
      this.scrollableParent = this.getScrollableParent(this.searchInput.nativeElement);
      if (this.scrollableParent) {
        this.scrollListener = () => this.adjustDropdownPosition();
        this.scrollableParent.addEventListener('scroll', this.scrollListener);
      }
    }, 500);
  }

  ngOnDestroy(): void {
    // Remove scroll listener when component is destroyed
    if (this.scrollableParent && this.scrollListener) {
      this.scrollableParent.removeEventListener('scroll', this.scrollListener);
    }
  }

  private async loadGoogleMaps(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return;
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
      componentRestrictions: { country: 'CA' }
    });

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete.getPlace();
        this.locationSelected.emit(place?.geometry ? place : null);
      });
    });
  }

  private adjustDropdownPosition(): void {
    if (!this.pacContainer || !this.searchInput) return;

    const inputRect = this.searchInput.nativeElement.getBoundingClientRect();
    this.pacContainer.style.top = `${inputRect.bottom + window.scrollY}px`;
    this.pacContainer.style.left = `${inputRect.left + window.scrollX}px`;
    this.pacContainer.style.width = `${inputRect.width}px`;
  }

  private getScrollableParent(element: HTMLElement): HTMLElement | null {
    let parent: HTMLElement | null = element.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }
  
}
