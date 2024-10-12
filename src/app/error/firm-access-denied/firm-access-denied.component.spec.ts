import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmAccessDeniedComponent } from './firm-access-denied.component';

describe('FirmAccessDeniedComponent', () => {
  let component: FirmAccessDeniedComponent;
  let fixture: ComponentFixture<FirmAccessDeniedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmAccessDeniedComponent]
    });
    fixture = TestBed.createComponent(FirmAccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
