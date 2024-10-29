import { TestBed } from '@angular/core/testing';

import { FlatpickrService } from './flatpickr.service';

describe('FlatpickrService', () => {
  let service: FlatpickrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlatpickrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
