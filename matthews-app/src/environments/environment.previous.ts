export const environment = {
  production: true,
  casesApiUrl:'https://develop.comdata.rs/MatthewsApp.API/Case',
  i4connectedApiUrl: 'https://matthewscremation.i4connected.cloud/api/api/',
  auth_config: {
    client_id: 'matthews.web',
    client_secret: '0be0470165fa49ca9631a2babc0a73d4',
    server_host: 'https://matthewscremation.i4connected.cloud/identity',
    redirect_url: 'https://develop.comdata.rs/MatthewsAppPrevious/authorizationcallback',
    end_session_redirect_url: 'https://develop.comdata.rs/MatthewsAppPrevious/endsessioncallback',
    scopes: 'profile openid email offline_access matthews.api api',
    pkce: true
  }
};
