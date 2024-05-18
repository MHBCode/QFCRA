import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFirmPageComponent } from './view-firm-page.component';

describe('ViewFirmPageComponent', () => {
  let component: ViewFirmPageComponent;
  let fixture: ComponentFixture<ViewFirmPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFirmPageComponent]
    });
    fixture = TestBed.createComponent(ViewFirmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
