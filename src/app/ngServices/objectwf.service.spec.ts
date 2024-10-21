import { TestBed } from '@angular/core/testing';

import { ObjectwfService } from './objectwf.service';

describe('ObjectwfService', () => {
  let service: ObjectwfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectwfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
