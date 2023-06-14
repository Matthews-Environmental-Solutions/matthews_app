import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { FacilityStatus } from "../models/facility-status.model";

@Injectable({
    providedIn: 'root'
})
export class FacilityStatusService {
    apiURL = environment.apiUrl;
    constructor(public httpClient: HttpClient) { }

    save(dto: FacilityStatus): Observable<FacilityStatus> {
        return this.httpClient.post<FacilityStatus>(`${this.apiURL}/FacilityStatus/Create`, dto)
        .pipe(catchError(this.handleError));
    }

    update(dto: FacilityStatus): Observable<FacilityStatus> {
        return this.httpClient.put<FacilityStatus>(`${this.apiURL}/FacilityStatus/Update`, dto)
        .pipe(catchError(this.handleError));
    }

    delete(dto: FacilityStatus): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiURL}/FacilityStatus/${dto.id}`)
        .pipe(catchError(this.handleError));
    }

    getAllStatusesByFacility(facilityId: string): Observable<FacilityStatus[]> {
        return this.httpClient.get<FacilityStatus[]>(`${this.apiURL}/FacilityStatus/GetFacilityStatusesByFacility/${facilityId}`)
        .pipe(catchError(this.handleError));
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
        window.alert(errorMessage);
        return throwError(() => {
            return errorMessage;
        });
    }

}