import { IdentityConfig } from '@matthews-app/identity-common';

export interface IdentityWebConfig extends IdentityConfig {
  loginOnStart: boolean;
  redirectUri: string;
}
