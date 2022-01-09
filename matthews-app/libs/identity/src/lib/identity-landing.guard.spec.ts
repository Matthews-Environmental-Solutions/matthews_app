import { TestBed, async, inject } from '@angular/core/testing';

import { IdentityLandingGuard } from './identity-landing.guard';

describe('IdentityLandingGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdentityLandingGuard]
    });
  });

  it('should ...', inject(
    [IdentityLandingGuard],
    (guard: IdentityLandingGuard) => {
      expect(guard).toBeTruthy();
    }
  ));
});
