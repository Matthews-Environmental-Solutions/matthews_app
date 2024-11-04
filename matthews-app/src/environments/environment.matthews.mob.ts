/* eslint-disable @typescript-eslint/naming-convention */
export const environment = {
    production: false,
      apiUrl: 'https://matthewsenvironmental.i4connected.cloud/MatthewsApp.API',
      i4connectedApiUrl: 'https://matthewsenvironmental.i4connected.cloud/api',
    auth_config: {
      client_id: 'matthews.app',
      client_secret: 'b8f30abd541943ff92a1d36ca72ed25e',
      server_host: 'https://matthewsenvironmental.i4connected.cloud/identity',
      redirect_url: 'com.matthews.app://authorizationcallback',
      end_session_redirect_url: 'com.matthews.app://endsessioncallback',
      scopes: 'profile openid email offline_access matthews.api api',
      pkce: true
    }
  };
