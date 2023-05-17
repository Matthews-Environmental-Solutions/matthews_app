import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, retry, throwError } from "rxjs";
import { Case } from "../models/case.model";

@Injectable({
    providedIn: 'root'
})
export class CaseService {
    apiURL = 'https://localhost:5001';
    constructor(public httpClient: HttpClient) { }

    getCasesFromJsonFile(days: Date[]) {
        return this.httpClient.get('/assets/cases.json');
    }

    getCases(days: Date[]): Observable<Case[]> {
        return this.httpClient.get<Case[]>(this.apiURL + '/Case/GetAllCases')
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((cases: Case[]) => {

                cases = cases.map(item => {
                    switch (item.gender) {
                        case 0:
                            item.genderText = 'Other';
                            break;
                        case 1:
                            item.genderText = 'Male';
                            break;
                        case 2:
                            item.genderText = 'Female';
                            break;
                    }

                    switch (item.containerType) {
                        case 0:
                            item.containerTypeText = 'None';
                            break;
                        case 1:
                            item.containerTypeText = 'Cardboard';
                            break;
                        case 2:
                            item.containerTypeText = 'Fiberboard';
                            break;
                        case 3:
                            item.containerTypeText = 'Hardwood';
                            break;
                    }

                    return item;
                });

                return cases;
            }));
    }

    getUnscheduledCases(): Observable<Case[]>{
        return this.httpClient.get<Case[]>(this.apiURL + '/Case/GetUnscheduledCases')
        .pipe(retry(1), catchError(this.handleError))
        .pipe(map((cases: Case[]) => {

            cases = cases.map(item => {
                switch (item.gender) {
                    case 0:
                        item.genderText = 'other'; // it will be used as key for translate
                        break;
                    case 1:
                        item.genderText = 'male'; // it will be used as key for translate
                        break;
                    case 2:
                        item.genderText = 'female'; // it will be used as key for translate
                        break;
                }

                switch (item.containerType) {
                    case 0:
                        item.containerTypeText = 'None';
                        break;
                    case 1:
                        item.containerTypeText = 'Cardboard';
                        break;
                    case 2:
                        item.containerTypeText = 'Fiberboard';
                        break;
                    case 3:
                        item.containerTypeText = 'Hardwood';
                        break;
                }

                return item;
            });

            return cases;
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
        window.alert(errorMessage);
        return throwError(() => {
            return errorMessage;
        });
    }
}