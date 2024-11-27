import { TestBed } from '@angular/core/testing';

import { EnforcementsActionsService } from './enforcements-actions.service';

describe('EnforcementsActionsService', () => {
  let service: EnforcementsActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnforcementsActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
