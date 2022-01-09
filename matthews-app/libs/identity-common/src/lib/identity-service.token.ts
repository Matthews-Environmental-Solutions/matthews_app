import { InjectionToken } from '@angular/core';
import { IdentityService } from './identity.service';

export const IDENTITY_SERVICE: InjectionToken<
  IdentityService
> = new InjectionToken<IdentityService>('IdentityService');
