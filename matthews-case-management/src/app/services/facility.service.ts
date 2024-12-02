import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { catchError, map, Observable, retry, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { Facility } from "../models/facility.model";

@Injectable({
    providedIn: 'root'
})
export class FacilityService {
    apiURL = environment.apiUrl;
    
    constructor(public httpClient: HttpClient, private translate: TranslateService) { }

    getFacilities(): Observable<Facility[]> {
        return this.httpClient.get<Facility[]>(this.apiURL + '/Facility/GetFacilities')
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((facilities: Facility[]) => {
                return facilities;
            }));
    }

    // Error handling
    handleError(error: any) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        // window.alert(errorMessage);
        return throwError(() => {
            return errorMessage;
        });
    }
}