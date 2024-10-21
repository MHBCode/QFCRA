import { TestBed } from '@angular/core/testing';

import { ParententityService } from './parententity.service';

describe('ParententityService', () => {
  let service: ParententityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParententityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
