import { OAuthModuleConfig } from 'angular-oauth2-oidc';
import { environment } from "src/environments/environment";

export const authModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: environment.allowedUrls,
    sendAccessToken: true,
  }
};