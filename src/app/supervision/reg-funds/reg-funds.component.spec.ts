import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegFundsComponent } from './reg-funds.component';

describe('RegFundsComponent', () => {
  let component: RegFundsComponent;
  let fixture: ComponentFixture<RegFundsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegFundsComponent]
    });
    fixture = TestBed.createComponent(RegFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
