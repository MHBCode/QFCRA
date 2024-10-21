import { TestBed } from '@angular/core/testing';

import { LogformService } from './logform.service';

describe('LogformService', () => {
  let service: LogformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
