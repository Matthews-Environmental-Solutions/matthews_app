import { InjectionToken } from '@angular/core';
import { IdentityExtraConfig } from './identity-extra.config';

export const IDENTITY_EXTRA_CONFIG: InjectionToken<
  IdentityExtraConfig
> = new InjectionToken<IdentityExtraConfig>('identityExtraConfig');
