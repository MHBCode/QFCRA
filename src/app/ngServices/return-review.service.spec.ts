import { TestBed } from '@angular/core/testing';

import { ReturnReviewService } from './return-review.service';

describe('ReturnReviewService', () => {
  let service: ReturnReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReturnReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
