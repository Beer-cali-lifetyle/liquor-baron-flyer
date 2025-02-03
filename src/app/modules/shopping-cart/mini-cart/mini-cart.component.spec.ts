/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MiniCartComponent } from './mini-cart.component';

describe('MiniCartComponent', () => {
  let component: MiniCartComponent;
  let fixture: ComponentFixture<MiniCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
