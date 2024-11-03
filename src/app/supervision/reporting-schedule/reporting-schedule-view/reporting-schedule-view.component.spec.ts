import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingScheduleViewComponent } from './reporting-schedule-view.component';

describe('ReportingScheduleViewComponent', () => {
  let component: ReportingScheduleViewComponent;
  let fixture: ComponentFixture<ReportingScheduleViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportingScheduleViewComponent]
    });
    fixture = TestBed.createComponent(ReportingScheduleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
