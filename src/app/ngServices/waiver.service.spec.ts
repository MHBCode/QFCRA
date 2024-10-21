import { TestBed } from '@angular/core/testing';

import { WaiverService } from './waiver.service';

describe('WaiverService', () => {
  let service: WaiverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaiverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
