import { InjectionToken } from '@angular/core';
import { IdentityConfig } from './identity.config';

export const IDENTITY_CONFIG: InjectionToken<
  IdentityConfig
> = new InjectionToken<IdentityConfig>('IdentityConfig');
