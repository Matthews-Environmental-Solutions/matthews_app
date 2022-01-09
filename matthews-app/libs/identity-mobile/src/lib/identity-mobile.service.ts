import { Injectable, Inject, NgZone } from '@angular/core';
import {
  IdentityService,
  WhoAmI,
  IDENTITY_CONFIG,
  IdentityConfig,
  IdentityEvent
} from '@matthews-app/identity-common';
import { AuthService } from './auth.service';
import { IAuthAction, AuthActions } from '@matthews-app/ionic-appauth';
import { config, Observable, from, BehaviorSubject, of } from 'rxjs';
import { map, filter, take, flatMap, catchError } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

import { Plugins, PluginListenerHandle } from '@capacitor/core';
import { TokenResponse } from '@openid/appauth';
import { App } from '@capacitor/app';

const { Storage, Application } = Plugins;

@Injectable()
export class IdentityMobileService extends IdentityService {
  events: Observable<
    IdentityEvent<IAuthAction>
  > = this.authService.authObservable.pipe(
    map<IAuthAction, IdentityEvent<IAuthAction>>(authAction => ({
      from: 'mobile',
      event: authAction
    }))
  );

  whoAmI: Observable<WhoAmI>;
  accessToken: Observable<string>;

  private whoAmISubject: BehaviorSubject<WhoAmI> = new BehaviorSubject(null);
  private accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject(
    null
  );

  private appStateChangeListener: PluginListenerHandle;

  constructor(private authService: AuthService) {
    super();

    this.whoAmI = this.whoAmISubject.asObservable();
    this.accessToken = this.accessTokenSubject.asObservable();

    this.authService.authObservable.subscribe(authAction => {
      switch (authAction.action) {
        case AuthActions.AutoSignInSuccess:
        case AuthActions.RefreshSuccess:
        case AuthActions.SignInSuccess:
          this.loadWhoAmI();
          this.loadAccessToken();
          this.initializeSessionCheck();
          break;
        case AuthActions.AutoSignInFailed:
        case AuthActions.RefreshFailed:
        case AuthActions.SignInFailed:
          break;
        default:
          break;
      }
    });

    this.authService.authObservable
      .pipe(
        filter(
          authAction =>
            authAction.action === AuthActions.AutoSignInSuccess ||
            authAction.action === AuthActions.RefreshSuccess ||
            authAction.action === AuthActions.SignInSuccess
        )
      )
      .subscribe(() => {
        this.initializeSessionCheck();
      });
  }

  logIn(): void {
    this.authService.signIn();
  }

  silentLogIn(): void {
    this.authService.signIn(null, true);
  }

  logOut(): void {
    this.authService.signOut().then(() => {
      this.removeSessionCheck();
    });
  }

  waitForLogIn(): Observable<boolean> {
    return this.authService.authObservable.pipe(
      filter(
        authAction =>
          authAction.action === AuthActions.SignInSuccess ||
          authAction.action === AuthActions.SignInFailed
      ),
      take(1),
      map(authAction => authAction.action === AuthActions.SignInSuccess)
    );
  }

  waitForLogOut(): Observable<boolean> {
    return this.authService.authObservable.pipe(
      filter(
        authAction =>
          authAction.action === AuthActions.SignOutSuccess ||
          authAction.action === AuthActions.SignOutFailed
      ),
      take(1),
      map(authAction => authAction.action === AuthActions.SignOutSuccess)
    );
  }

  loadWhoAmI() {
    this.authService
      .getUserInfo<WhoAmI>()
      .then(userInfo => {
        if (userInfo === undefined) {
          this.whoAmISubject.next(null);
          return;
        }

        this.whoAmISubject.next(userInfo);
      })
      .catch(() => this.whoAmISubject.next(null));
  }

  loadAccessToken() {
    this.authService
      .getValidToken()
      .then(tokenResponse => {
        if (!tokenResponse.isValid()) {
          this.accessTokenSubject.next(null);
          return;
        }

        this.accessTokenSubject.next(tokenResponse.accessToken);
      })
      .catch(() => this.accessTokenSubject.next(null));
  }

  getInstantWhoAmI(): Observable<WhoAmI> {
    return from(this.authService.getUserInfo<WhoAmI>()).pipe(
      catchError<WhoAmI, Observable<WhoAmI>>(() => of(null)),
      take(1),
      map(userInfo => {
        if (userInfo === undefined) {
          this.whoAmISubject.next(null);
          return null;
        }

        this.whoAmISubject.next(userInfo);
        return userInfo;
      })
    );
  }

  getInstantAccessToken(): Observable<string> {
    return from(this.authService.getValidToken()).pipe(
      catchError<TokenResponse, Observable<TokenResponse>>(() => of(null)),
      take(1),
      map<TokenResponse, string>(tokenResponse => {
        if (tokenResponse === undefined || !tokenResponse.isValid()) {
          this.accessTokenSubject.next(null);
          return null;
        }

        this.accessTokenSubject.next(tokenResponse.accessToken);
        return tokenResponse.accessToken;
      })
    );
  }

  private initializeSessionCheck() {
    if (this.appStateChangeListener) {
      this.removeSessionCheck();
    }

    this.appStateChangeListener = App.addListener(
      'appStateChange',
      ({isActive}) => {
        if (isActive) {
          this.removeSessionCheck();

          this.authService.signIn(null, true);
       }
      }
    );
  }

  private removeSessionCheck() {
    if (this.appStateChangeListener) {
      this.appStateChangeListener.remove();
    }
    this.appStateChangeListener = null;
  }
}
