import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditScopeAuthorizedComponent } from './edit-scope-authorized.component';

describe('EditScopeAuthorizedComponent', () => {
  let component: EditScopeAuthorizedComponent;
  let fixture: ComponentFixture<EditScopeAuthorizedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditScopeAuthorizedComponent]
    });
    fixture = TestBed.createComponent(EditScopeAuthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
