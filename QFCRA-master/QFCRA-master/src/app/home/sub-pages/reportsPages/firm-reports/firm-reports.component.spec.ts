import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmReportsComponent } from './firm-reports.component';

describe('FirmReportsComponent', () => {
  let component: FirmReportsComponent;
  let fixture: ComponentFixture<FirmReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmReportsComponent]
    });
    fixture = TestBed.createComponent(FirmReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
