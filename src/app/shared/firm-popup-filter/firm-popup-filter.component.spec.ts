import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmPopupFilterComponent } from './firm-popup-filter.component';

describe('FirmPopupFilterComponent', () => {
  let component: FirmPopupFilterComponent;
  let fixture: ComponentFixture<FirmPopupFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmPopupFilterComponent]
    });
    fixture = TestBed.createComponent(FirmPopupFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
