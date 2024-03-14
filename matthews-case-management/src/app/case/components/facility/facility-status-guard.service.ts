import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, of, switchMap, take } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { UserDetails } from "src/app/models/user-details.model";
import { StateService } from "src/app/services/states.service";

@Injectable({ providedIn: 'root' })
export class FacilityGuard implements CanActivate {
    constructor (
        private stateService: StateService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.stateService.canActivateFacilityUrl$
        .pipe(
            // tap(x => console.log('You tried to go to ' + state.url + ' and this guard said ' + x)),
            map(x => x? x : this.router.createUrlTree(['']) )
            );
    }
}
