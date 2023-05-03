import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

    issuer: 'https://matthewscremation.i4connected.cloud/identity',

    redirectUri: window.location.origin, // it is:   http://localhost:4200
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes

    clientId: 'i4connected.cremator',
    responseType: 'code',
    scope: 'openid profile email offline_access api matthews.api',

    sessionChecksEnabled: true,
    showDebugInformation: true,
    clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
    nonceStateSeparator: 'semicolon', // Real semicolon gets mangled by Duende ID Server's URI encoding
    disableAtHashCheck: true,
};