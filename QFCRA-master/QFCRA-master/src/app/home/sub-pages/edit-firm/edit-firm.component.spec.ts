import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFirmComponent } from './edit-firm.component';

describe('EditFirmComponent', () => {
  let component: EditFirmComponent;
  let fixture: ComponentFixture<EditFirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditFirmComponent]
    });
    fixture = TestBed.createComponent(EditFirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
