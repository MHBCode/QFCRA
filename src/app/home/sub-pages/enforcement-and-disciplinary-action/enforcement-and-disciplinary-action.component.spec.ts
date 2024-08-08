import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementAndDisciplinaryActionComponent } from './enforcement-and-disciplinary-action.component';

describe('EnforcementAndDisciplinaryActionComponent', () => {
  let component: EnforcementAndDisciplinaryActionComponent;
  let fixture: ComponentFixture<EnforcementAndDisciplinaryActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnforcementAndDisciplinaryActionComponent]
    });
    fixture = TestBed.createComponent(EnforcementAndDisciplinaryActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
