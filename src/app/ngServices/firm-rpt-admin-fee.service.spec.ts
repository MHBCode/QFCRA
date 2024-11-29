import { TestBed } from '@angular/core/testing';

import { FirmRptAdminFeeService } from './firm-rpt-admin-fee.service';

describe('FirmRptAdminFeeService', () => {
  let service: FirmRptAdminFeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirmRptAdminFeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
