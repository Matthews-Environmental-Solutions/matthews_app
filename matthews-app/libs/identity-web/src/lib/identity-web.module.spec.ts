import { async, TestBed } from '@angular/core/testing';
import { IdentityWebModule } from './identity-web.module';

describe('IdentityWebModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IdentityWebModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(IdentityWebModule).toBeDefined();
  });
});
