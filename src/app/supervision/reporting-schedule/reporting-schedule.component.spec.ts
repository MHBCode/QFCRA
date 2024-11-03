import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingScheduleComponent } from './reporting-schedule.component';

describe('ReportingScheduleComponent', () => {
  let component: ReportingScheduleComponent;
  let fixture: ComponentFixture<ReportingScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportingScheduleComponent]
    });
    fixture = TestBed.createComponent(ReportingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
