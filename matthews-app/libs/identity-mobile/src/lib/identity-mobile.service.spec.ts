import { TestBed } from '@angular/core/testing';

import { IdentityMobileService } from './identity-mobile.service';

describe('IdentityMobileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IdentityMobileService = TestBed.get(IdentityMobileService);
    expect(service).toBeTruthy();
  });
});
