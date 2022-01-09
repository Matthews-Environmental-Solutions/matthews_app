import { IdentityConfig } from '@matthews-app/identity-common';

export interface IdentityMobileConfig extends IdentityConfig {
  redirectUrl: string;
  endSessionRedirectUrl: string;
  loginHint?: string;
}
