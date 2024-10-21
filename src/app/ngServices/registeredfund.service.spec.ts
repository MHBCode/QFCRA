import { TestBed } from '@angular/core/testing';

import { RegisteredfundService } from './registeredfund.service';

describe('RegisteredfundService', () => {
  let service: RegisteredfundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisteredfundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
