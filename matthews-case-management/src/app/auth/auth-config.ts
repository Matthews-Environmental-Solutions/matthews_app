import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authConfig: AuthConfig = {

    issuer: 'https://matthewscremation.i4connected.cloud/identity',

    redirectUri: window.location.origin + environment.baseUrl, // it is:   http://localhost:4200,  'https://develop.comdata.rs/MatthewsApp.API'
    silentRefreshRedirectUri: window.location.origin + environment.baseUrl + '/silent-refresh.html',
    useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes

    clientId: environment.identityServerClientId, //'i4connected.cremator.development'
    responseType: 'code',
    scope: 'openid profile email offline_access api matthews.api',

    // sessionChecksEnabled: true,
    // showDebugInformation: true,
    // clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
    // nonceStateSeparator: 'semicolon', // Real semicolon gets mangled by Duende ID Server's URI encoding
    // disableAtHashCheck: true,
};