import { Injectable, Inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  IDENTITY_SERVICE,
  IdentityService,
  WhoAmI
} from '@matthews-app/identity-common';
import { map, catchError, take } from 'rxjs/operators';

/**
 * IdentityGuard
 *
 * Guard to protect routes that require authenticated user
 * in order to see content
 *
 * @export
 */
@Injectable()
export class IdentityGuard implements CanActivate {
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
        if (whoAmI !== undefined && whoAmI !== null) {
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

export interface IdentityGuardConfig {
  redirectTo: string[];
}
