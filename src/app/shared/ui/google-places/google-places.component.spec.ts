/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GooglePlacesComponent } from './google-places.component';

describe('GooglePlacesComponent', () => {
  let component: GooglePlacesComponent;
  let fixture: ComponentFixture<GooglePlacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GooglePlacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglePlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
