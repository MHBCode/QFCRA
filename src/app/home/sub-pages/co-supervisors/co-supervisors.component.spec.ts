import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoSupervisorsComponent } from './co-supervisors.component';

describe('CoSupervisorsComponent', () => {
  let component: CoSupervisorsComponent;
  let fixture: ComponentFixture<CoSupervisorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoSupervisorsComponent]
    });
    fixture = TestBed.createComponent(CoSupervisorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
