import { Injectable, Inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { IDENTITY_SERVICE, IdentityService } from '@matthews-app/identity-common';
import { catchError, map, take } from 'rxjs/operators';
import { IdentityGuardConfig } from './identity.guard';

@Injectable({
  providedIn: 'root'
})
export class IdentityLandingGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_SERVICE) private identityService: IdentityService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.identityService.getInstantWhoAmI().pipe(
      map(whoAmI => {
        if (whoAmI === undefined || whoAmI === null) {
          return true;
        }

        if (route.data !== undefined && route.data !== null) {
          const config = route.data as IdentityGuardConfig;

          if (
            config.redirectTo !== undefined &&
            config.redirectTo !== null &&
            config.redirectTo.length > 0
          ) {
            return this.router.createUrlTree(route.data.redirectTo);
          }
        }

        return false;
      })
    );
  }
}
