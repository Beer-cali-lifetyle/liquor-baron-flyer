import { Directive, ElementRef, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[googlePlacesAutocomplete]',
  standalone: true,
})
export class GooglePlacesAutocompleteDirective implements OnInit {
  @Input() types: string[] = [];
  @Input() country: string[] = [];
  @Output() placeChanged: EventEmitter<any> = new EventEmitter();

  private autocomplete!: any;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    const options: any = {
      types: this.types,
      componentRestrictions: { country: this.country.length > 0 ? this.country : undefined },
      fields: ["place_id", "geometry", "name", "formatted_address"],
    };

    this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, options);

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete.getPlace();
        this.placeChanged.emit(place);
      });
    });
  }
  
}
