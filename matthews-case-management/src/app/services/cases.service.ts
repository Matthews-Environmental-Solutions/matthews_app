import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, retry, throwError } from "rxjs";
import { Case } from "../models/case.model";

@Injectable({
    providedIn: 'root'
})
export class CaseService {
    apiURL = 'https://localhost:5001';
    constructor(public httpClient: HttpClient) { }

    getCases(days: Date[]) {
        return this.httpClient.get('/assets/cases.json');
    }

    getCases2(days: Date[]): Observable<Case[]> {
        return this.httpClient.get<Case[]>(this.apiURL + '/Case').pipe(retry(1), catchError(this.handleError));
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