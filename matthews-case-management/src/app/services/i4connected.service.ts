import { Observable, catchError, concatMap, retry, throwError } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Device } from "../models/device.model";
import { Facility } from "../models/facility.model";
import { UserDetails } from "../models/user-details.model";
import { FacilityService } from "./facility.service";

@Injectable({
    providedIn: 'root'
})
export class I4connectedService {

    apiUrl: string = environment.i4connectedApiUrl;

    constructor(public httpClient: HttpClient, private facilityService: FacilityService) { }

    getSites(): Observable<Facility[]> {
        return this.httpClient.get<Facility[]>(`${this.apiUrl}/api/sites/list`)
            .pipe(
                concatMap((firstResponse: Facility[]) => {
                    return this.facilityService.getFacilities(firstResponse);
                }
                )
            )
            .pipe(retry(1), catchError(this.handleError));
    }



    getSite(id: string): Observable<Facility> {
        return this.httpClient.get<Facility>(`${this.apiUrl}/api/sites/${id}/details`)
            .pipe(retry(1), catchError(this.handleError));
    }

    getDevicesByFacility2(facilityId: string): Observable<Device[]> {
        return this.httpClient.post<Device[]>(`${this.apiUrl}/api/devices/list?pageSize=1000000&pageNumber=1&sortFields=0`,
            {
              "DeviceTypeIds": [
                1
              ],
                "selectedItems": [
                    {
                        "id": facilityId,
                        "type": 2
                    }
                ]
            });
    }


    getUserInfoDetails(userId: string): Observable<UserDetails> {
        return this.httpClient.get<UserDetails>(`${this.apiUrl}/api/users/${userId}/details`)
            .pipe(retry(1), catchError(this.handleError));;
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
