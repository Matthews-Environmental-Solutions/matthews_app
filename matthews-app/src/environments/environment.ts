// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  auth_config: {
    client_id: 'matthews.app',
    client_secret: 'b8f30abd541943ff92a1d36ca72ed25e',
    server_host: 'https://matthewscremation.i4connected.cloud/identity',
    redirect_url: 'com.matthews.app://authorizationcallback',
    end_session_redirect_url: 'com.matthews.app://endsessioncallback',
    scopes: 'profile openid email api matthews.api',
    pkce: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
