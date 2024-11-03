import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnfActionsComponent } from './enf-actions.component';

describe('EnfActionsComponent', () => {
  let component: EnfActionsComponent;
  let fixture: ComponentFixture<EnfActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnfActionsComponent]
    });
    fixture = TestBed.createComponent(EnfActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
