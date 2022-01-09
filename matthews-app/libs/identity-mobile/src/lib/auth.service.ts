import { Injectable, NgZone } from '@angular/core';
import {
  IonicAuth,
  AuthBrowser,
  IonicAuthorizationRequestHandler,
  IonicImplicitRequestHandler,
  IAuthConfig
} from '@matthews-app/ionic-appauth';
import { Requestor, StorageBackend } from '@openid/appauth';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { App } = Plugins;

@Injectable()
export class AuthService extends IonicAuth {
  constructor(
    requestor: Requestor,
    storage: StorageBackend,
    browser: AuthBrowser,
    private platform: Platform,
    private ngZone: NgZone
  ) {
    super(browser, storage, requestor);
  }

  configure(config: IAuthConfig) {
    this.authConfig = config;
  }

  public async startUpAsync() {
    if (this.platform.is('capacitor')) {
      App.addListener('appUrlOpen', (data: any) => {
        if (data.url !== undefined) {
          this.ngZone.run(() => {
            this.handleCallback(data.url);
          });
        }
      });
    }

    super.startUpAsync();
  }

  private handleCallback(callbackUrl: string): void {
    if (callbackUrl.indexOf(this.authConfig.redirect_url) === 0) {
      this.AuthorizationCallBack(callbackUrl);
    }

    if (callbackUrl.indexOf(this.authConfig.end_session_redirect_url) === 0) {
      this.EndSessionCallBack();
    }
  }
}
