import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegFundsCreateComponent } from './reg-funds-create.component';

describe('RegFundsCreateComponent', () => {
  let component: RegFundsCreateComponent;
  let fixture: ComponentFixture<RegFundsCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegFundsCreateComponent]
    });
    fixture = TestBed.createComponent(RegFundsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
