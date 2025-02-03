/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OrderConfirmedComponent } from './order-confirmed.component';

describe('OrderConfirmedComponent', () => {
  let component: OrderConfirmedComponent;
  let fixture: ComponentFixture<OrderConfirmedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderConfirmedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
