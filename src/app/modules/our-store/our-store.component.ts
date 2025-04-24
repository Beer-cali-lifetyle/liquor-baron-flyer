import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../order-confirmed/order-confirmed.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-our-store',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './our-store.component.html',
  styleUrl: './our-store.component.scss'
})
export class OurStoreComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  mapUrl: string = '';
  constructor(private fb: FormBuilder,
    private ApiService: ApiService,
    private sanitizer: DomSanitizer
  ) {

  }
  stores: any = [];

  async ngOnInit() {
    await this.fetchStores();
  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps().then(() => {
      this.initializeMap();
    }).catch((error) => {
      console.error('Error loading Google Maps API:', error);
    });
  }

  private async loadGoogleMaps(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return;
    }

    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFtrosISezP-8z2NwTWKhD_5pNHoi0wRw&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  async fetchStores() {
    await this.ApiService.fetchStores().then(async (res) => {
      this.stores = res;
      this.initializeMap();
    })
  }

  private initializeMap(): void {
    const geocoder = new google.maps.Geocoder();
    const defaultAddress = '1109-116 Grande Blvd W, Cochrane, AB T4C 2G4';
  
    geocoder.geocode({ address: defaultAddress }, (results: any, status: any) => {
      let mapCenter = { lat: 22.9734, lng: 78.6569 }; // Fallback default center
  
      if (status === 'OK' && results[0]) {
        mapCenter = results[0].geometry.location;
      }
  
      const map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 10,
        center: mapCenter
      });
  
      // Add marker for default location
      new google.maps.Marker({
        map,
        position: mapCenter,
        title: 'Default Store Location'
      });
  
      // Add dynamic store markers
      this.addStoreMarkers(map);
    });
  }
  
  private addStoreMarkers(map: any): void {
    const geocoder = new google.maps.Geocoder();
  
    for (const store of this.stores?.data?.data) {
      if (store.head_office_address) {
        geocoder.geocode({ address: store.head_office_address }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              title: store.head_office_address
            });
          }
        });
      }
    }
  }
  

}
