import { IdentityWebConfig } from './identity-web.config';
import { IdentityWebService } from './identity-web.service';
import { OAuthService } from 'angular-oauth2-oidc';

export function identityWebFactory(
  config: IdentityWebConfig,
  oAuthService: OAuthService
) {
  oAuthService.configure({
    // From configuration
    issuer: config.issuer,
    clientId: config.client,
    scope: config.scope || 'openid profile email offline_access',
    redirectUri: config.redirectUri,
    showDebugInformation: config.debug,
    requireHttps: config.requireHttps,
    // Web defined
    responseType: 'code',
    sessionChecksEnabled: true
  });

  return () => {
    if (config.loginOnStart) {
      return oAuthService.loadDiscoveryDocumentAndLogin();
    }

    return oAuthService.loadDiscoveryDocumentAndTryLogin();
  };
}
