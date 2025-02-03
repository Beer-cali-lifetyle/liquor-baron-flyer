/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OrderRejectedComponent } from './order-rejected.component';

describe('OrderRejectedComponent', () => {
  let component: OrderRejectedComponent;
  let fixture: ComponentFixture<OrderRejectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderRejectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
