import { TestBed } from '@angular/core/testing';

import { ObjectwfdefService } from './objectwfdef.service';

describe('ObjectwfdefService', () => {
  let service: ObjectwfdefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectwfdefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
