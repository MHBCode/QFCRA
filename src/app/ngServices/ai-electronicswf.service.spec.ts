import { TestBed } from '@angular/core/testing';

import { AiElectronicswfService } from './ai-electronicswf.service';

describe('AiElectronicswfService', () => {
  let service: AiElectronicswfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiElectronicswfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
