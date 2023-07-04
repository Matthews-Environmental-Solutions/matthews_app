import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, tap } from "rxjs";
import { StateService } from "../services/states.service";

@Injectable({ providedIn: 'root' })
export class CaseAddEditGuard implements CanActivate {

    private GUID_EMPTY: string = '00000000-0000-0000-0000-000000000000';

    constructor(
        private router: Router,
        private stateService: StateService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.stateService.selectedFacilityId$
            .pipe(
                map(x => {
                    if (x == undefined || x == this.GUID_EMPTY || x.length == 0) {
                        return this.router.createUrlTree(['']);
                    }
                    return true;
                })
            );
    }
}