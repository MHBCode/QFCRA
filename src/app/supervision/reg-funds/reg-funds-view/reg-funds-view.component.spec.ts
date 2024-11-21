import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegFundsViewComponent } from './reg-funds-view.component';

describe('RegFundsViewComponent', () => {
  let component: RegFundsViewComponent;
  let fixture: ComponentFixture<RegFundsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegFundsViewComponent]
    });
    fixture = TestBed.createComponent(RegFundsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
