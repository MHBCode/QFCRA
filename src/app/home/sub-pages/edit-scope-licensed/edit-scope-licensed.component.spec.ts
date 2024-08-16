import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditScopeLicensedComponent } from './edit-scope-licensed.component';

describe('EditScopeLicensedComponent', () => {
  let component: EditScopeLicensedComponent;
  let fixture: ComponentFixture<EditScopeLicensedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditScopeLicensedComponent]
    });
    fixture = TestBed.createComponent(EditScopeLicensedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
