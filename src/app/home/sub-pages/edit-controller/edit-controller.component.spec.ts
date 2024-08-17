import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditControllerComponent } from './edit-controller.component';

describe('EditControllerComponent', () => {
  let component: EditControllerComponent;
  let fixture: ComponentFixture<EditControllerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditControllerComponent]
    });
    fixture = TestBed.createComponent(EditControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
