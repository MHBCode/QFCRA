import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnfActionsViewDetailsComponent } from './enf-actions-view-details.component';

describe('EnfActionsViewDetailsComponent', () => {
  let component: EnfActionsViewDetailsComponent;
  let fixture: ComponentFixture<EnfActionsViewDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnfActionsViewDetailsComponent]
    });
    fixture = TestBed.createComponent(EnfActionsViewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
