import { OAuthModuleConfig } from 'angular-oauth2-oidc';

export const authModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: ['https://matthewscremation.i4connected.cloud/api', 'https://localhost:5001', 'https://develop.comdata.rs/MatthewsApp.API'],
    sendAccessToken: true,
  }
};