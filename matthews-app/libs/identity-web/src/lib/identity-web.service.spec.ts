import { TestBed } from '@angular/core/testing';

import { IdentityWebService } from './identity-web.service';

describe('IdentityAngularService', () => {
  let service: IdentityWebService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(IdentityWebService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
