import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIndividualStatusChangeComponent } from './view-individual-status-change.component';

describe('ViewIndividualStatusChangeComponent', () => {
  let component: ViewIndividualStatusChangeComponent;
  let fixture: ComponentFixture<ViewIndividualStatusChangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewIndividualStatusChangeComponent]
    });
    fixture = TestBed.createComponent(ViewIndividualStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
