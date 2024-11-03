import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionViewComponent } from './supervision-view.component';

describe('SupervisionViewComponent', () => {
  let component: SupervisionViewComponent;
  let fixture: ComponentFixture<SupervisionViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupervisionViewComponent]
    });
    fixture = TestBed.createComponent(SupervisionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
