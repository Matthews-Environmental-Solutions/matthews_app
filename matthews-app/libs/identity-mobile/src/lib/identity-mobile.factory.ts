import { IdentityMobileConfig } from './identity-mobile.config';
import { AuthService } from './auth.service';
import { AuthActions } from '@matthews-app/ionic-appauth';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

export function identityMobileFactory(
  config: IdentityMobileConfig,
  authService: AuthService,
  platform: Platform
) {
  authService.configure({
    identity_server: config.issuer,
    identity_client: config.client,
    scopes: config.scope,
    redirect_url: config.redirectUrl,
    end_session_redirect_url: config.endSessionRedirectUrl,
    usePkce: true
  });

  return () => {
    let subscription: Subscription;

    return new Promise<void>(resolve => {
      platform.ready().then(() => {
        subscription = authService.authObservable.subscribe(auth => {
          if (auth.action === AuthActions.Default) {
            authService.startUpAsync().then(() => {
              resolve();
            });
          }
        });
      });
    }).then(() => {
      // Unsubscribe after initial login
      subscription.unsubscribe();
    });
  };
}
