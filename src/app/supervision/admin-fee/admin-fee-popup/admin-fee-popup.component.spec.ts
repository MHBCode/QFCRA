import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeePopupComponent } from './admin-fee-popup.component';

describe('AdminFeePopupComponent', () => {
  let component: AdminFeePopupComponent;
  let fixture: ComponentFixture<AdminFeePopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminFeePopupComponent]
    });
    fixture = TestBed.createComponent(AdminFeePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
