import { Injectable } from '@angular/core';
import {
  IdentityService,
  WhoAmI,
  IdentityEvent
} from '@matthews-app/identity-common';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { filter, take, map, catchError } from 'rxjs/operators';
import { Observable, from, of, BehaviorSubject, pipe } from 'rxjs';

@Injectable()
export class IdentityWebService extends IdentityService {
  events: Observable<IdentityEvent<OAuthEvent>> = this.oAuthService.events.pipe(
    map<OAuthEvent, IdentityEvent<OAuthEvent>>(oAuthEvent => ({
      from: 'web',
      event: oAuthEvent
    }))
  );

  whoAmI: Observable<WhoAmI>;
  accessToken: Observable<string>;

  private whoAmISubject: BehaviorSubject<WhoAmI> = new BehaviorSubject(null);
  private accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject(
    null
  );

  constructor(private oAuthService: OAuthService) {
    super();

    this.whoAmI = this.whoAmISubject.asObservable();
    this.accessToken = this.accessTokenSubject.asObservable();

    this.oAuthService.events.subscribe(event => {
      switch (event.type) {
        case 'token_received':
        case 'token_refreshed':
        case 'silently_refreshed':
          break;
        case 'session_error':
        case 'session_terminated':
          this.oAuthService.logOut();
          break;
        default:
          break;
      }
    });
  }

  loadWhoAmI(): void {
    if (!this.oAuthService.hasValidAccessToken()) {
      this.whoAmISubject.next(null);
      return;
    }

    this.oAuthService
      .loadUserProfile()
      .then(userInfo => {
        if (userInfo === undefined) {
          this.whoAmISubject.next(null);
          return;
        }

        this.whoAmISubject.next(userInfo);
      })
      .catch(() => {
        this.whoAmISubject.next(null);
      });
  }

  loadAccessToken(): void {
    const accessToken = this.oAuthService.getAccessToken();

    if (accessToken === undefined || accessToken === null) {
      this.accessTokenSubject.next(null);
      return;
    }

    this.accessTokenSubject.next(accessToken);
  }

  getInstantWhoAmI(): Observable<WhoAmI> {
    if (!this.oAuthService.getAccessToken()) {
      return of(null);
    }

    return from(this.oAuthService.loadUserProfile()).pipe(
      catchError(() => of(null)),
      take(1),
      map(userProfile => {
        if (userProfile === undefined) {
          this.whoAmISubject.next(null);
          return null;
        }

        this.whoAmISubject.next(userProfile);
        return userProfile;
      })
    );
  }

  getInstantAccessToken(): Observable<string> {
    return of(this.oAuthService.getAccessToken()).pipe(
      catchError<string, Observable<string>>(() => {
        return of(null);
      }),
      map(accessToken => {
        if (accessToken === undefined) {
          this.accessTokenSubject.next(null);
          return null;
        }

        this.accessTokenSubject.next(accessToken);
        return accessToken;
      })
    );
  }

  logIn(): void {
    this.oAuthService.initCodeFlow();
  }

  logOut(): void {
    this.oAuthService.logOut();
  }
}
