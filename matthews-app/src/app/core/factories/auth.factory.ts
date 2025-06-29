/* eslint-disable eol-last */
import { Platform } from '@ionic/angular';
import { StorageBackend, Requestor } from '@openid/appauth';
import { AuthService, Browser } from 'ionic-appauth';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { NgZone } from '@angular/core';
import { CustomAuthService } from '../custom-auth.service';
import { HttpClient } from '@angular/common/http';


export const authFactory = (platform: Platform, ngZone: NgZone,
    requestor: Requestor, browser: Browser,  storage: StorageBackend, http: HttpClient) => {

    const authService = new CustomAuthService(browser, storage, requestor, http);
    authService.authConfig = environment.auth_config;

    if (!platform.is('cordova')) {
      //  authService.authConfig.redirect_url = window.location.origin + '/auth/callback';
      //  authService.authConfig.end_session_redirect_url = window.location.origin + '/auth/endsession';
    }

    if (platform.is('capacitor')) {
        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            if (event.url !== undefined) {
                ngZone.run(() => {
                    if ((event.url).indexOf(authService.authConfig.redirect_url) === 0) {
                        authService.authorizationCallback(event.url);
                    }else{
                        authService.endSessionCallback();
                    }
                });
            }
        });
    }

    return authService;
};