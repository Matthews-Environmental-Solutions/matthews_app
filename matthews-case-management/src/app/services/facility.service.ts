import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { catchError, map, Observable, retry, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { Facility } from "../models/facility.model";
import { ResponseCommunicationDto } from "../models/communication-response-dto.model";

@Injectable({
    providedIn: 'root'
})
export class FacilityService {
    apiURL = environment.apiUrl;
    
    constructor(public httpClient: HttpClient, private translate: TranslateService) { }

    getFacilities(facilities: Facility[]): Observable<Facility[]> {
        return this.httpClient.post<Facility[]>(this.apiURL + '/Facility/GetFacilities', facilities)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((facilities: Facility[]) => {
                return facilities;
            }));
    }

    subscribeToGroup(facilityId: string): Observable<ResponseCommunicationDto> {
        return this.httpClient.get<ResponseCommunicationDto>(`${this.apiURL}/Facility/SubscribeToGroup/${facilityId}`)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((response: ResponseCommunicationDto) => {
                return response;
            }));
    }

    unsubscribeFromGroup(facilityId: string): Observable<ResponseCommunicationDto> {
        return this.httpClient.get<ResponseCommunicationDto>(`${this.apiURL}/Facility/UnsubscribeFromGroup/${facilityId}`)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((response: ResponseCommunicationDto) => {
                return response;
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