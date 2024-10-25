import { TestBed } from '@angular/core/testing';

import { SharepointDocumentsService } from './sharepoint-documents.service';

describe('SharepointDocumentsService', () => {
  let service: SharepointDocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharepointDocumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
