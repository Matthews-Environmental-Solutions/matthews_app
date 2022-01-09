import { async, TestBed } from '@angular/core/testing';
import { IdentityMobileModule } from './identity-mobile.module';

describe('IdentityMobileModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IdentityMobileModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(IdentityMobileModule).toBeDefined();
  });
});
