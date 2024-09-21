import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualRegistrationStatusComponent } from './individual-registration-status.component';

describe('IndividualRegistrationStatusComponent', () => {
  let component: IndividualRegistrationStatusComponent;
  let fixture: ComponentFixture<IndividualRegistrationStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualRegistrationStatusComponent]
    });
    fixture = TestBed.createComponent(IndividualRegistrationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
