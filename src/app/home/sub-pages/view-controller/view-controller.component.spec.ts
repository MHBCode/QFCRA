import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewControllerComponent } from './view-controller.component';

describe('ViewControllerComponent', () => {
  let component: ViewControllerComponent;
  let fixture: ComponentFixture<ViewControllerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewControllerComponent]
    });
    fixture = TestBed.createComponent(ViewControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
