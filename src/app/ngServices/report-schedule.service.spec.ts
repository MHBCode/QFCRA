import { TestBed } from '@angular/core/testing';

import { ReportScheduleService } from './report-schedule.service';

describe('ReportScheduleService', () => {
  let service: ReportScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
