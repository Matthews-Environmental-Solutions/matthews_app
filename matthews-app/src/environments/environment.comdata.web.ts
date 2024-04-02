/* eslint-disable @typescript-eslint/naming-convention */
// comdata-web
export const environment = {
  production: false,
  apiUrl: 'https://develop.comdata.rs/MatthewsApp.API',
  i4connectedApiUrl: 'https://matthewsenvironmental.i4connected.cloud/api',
  auth_config: {
    client_id: 'matthews.web',
    client_secret: '0be0470165fa49ca9631a2babc0a73d4',
    server_host: 'https://matthewsenvironmental.i4connected.cloud/identity',
    redirect_url: 'https://develop.comdata.rs/MatthewsApp/authorizationcallback',
    end_session_redirect_url: 'https://develop.comdata.rs/MatthewsApp/authorizationcallback',
    scopes: 'profile openid email offline_access matthews.api api',
    pkce: true
  }
};
