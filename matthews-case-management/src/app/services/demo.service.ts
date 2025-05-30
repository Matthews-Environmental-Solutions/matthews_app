import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, retry, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class DemoService {
    apiURL = environment.apiUrl;

    constructor(public httpClient: HttpClient) { }

    isUseDemoEntitiesOnly(): Observable<boolean> {
    return this.httpClient.get(`${this.apiURL}/Demo/IsUseDemoEntitiesOnly`, { responseType: 'text' })
        .pipe(
            retry(1),
            map(response => response === 'True'), // Convert string to boolean
            catchError(this.handleError)
        );
    }

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