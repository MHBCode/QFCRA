import { TestBed } from '@angular/core/testing';

import { ActionItemsService } from './action-items.service';

describe('ActionItemsService', () => {
  let service: ActionItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
