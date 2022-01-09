import { TestBed } from '@angular/core/testing';

import { IdentityInterceptor } from './identity.interceptor';

describe('IdentityInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [IdentityInterceptor]
    })
  );

  it('should be created', () => {
    const interceptor: IdentityInterceptor = TestBed.inject(
      IdentityInterceptor
    );
    expect(interceptor).toBeTruthy();
  });
});
