import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, retry, throwError } from "rxjs";
import { Facility } from "../models/facility.model";

@Injectable({
    providedIn: 'root'
})
export class I4connectedService {

    apiUrl: string = 'https://matthewscremation.i4connected.cloud/api';

    constructor(public httpClient: HttpClient){}

    getSites(): Observable<Facility[]> {
        return this.httpClient.get<Facility[]>(this.apiUrl + '/api/sites/list')
        .pipe(retry(1), catchError(this.handleError));
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
        window.alert(errorMessage);
        return throwError(() => {
            return errorMessage;
        });
    }
}