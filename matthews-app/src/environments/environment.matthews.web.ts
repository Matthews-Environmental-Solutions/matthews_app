/* eslint-disable @typescript-eslint/naming-convention */
export const environment = {
  production: false,
  apiUrl: 'https://matthewscremation.i4connected.cloud/MatthewsApp.API',
  i4connectedApiUrl: 'https://matthewscremation.i4connected.cloud/api',
  auth_config: {
    client_id: 'matthews.web',
    client_secret: '0be0470165fa49ca9631a2babc0a73d4',
    server_host: 'https://matthewscremation.i4connected.cloud/identity',
    redirect_url: 'https://matthewscremation.i4connected.cloud/MatthewsApp.Mobile/authorizationcallback',
    end_session_redirect_url: 'https://matthewscremation.i4connected.cloud/MatthewsApp.Mobile/authorizationcallback',
    scopes: 'profile openid email offline_access matthews.api api',
    pkce: true
  }
};
