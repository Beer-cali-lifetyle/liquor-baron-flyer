import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurStoreComponent } from './our-store.component';

describe('OurStoreComponent', () => {
  let component: OurStoreComponent;
  let fixture: ComponentFixture<OurStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurStoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
