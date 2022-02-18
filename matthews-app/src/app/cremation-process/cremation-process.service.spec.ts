import { TestBed } from '@angular/core/testing';

import { CremationProcessService } from './cremation-process.service';

describe('CremationProcessService', () => {
  let service: CremationProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CremationProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
