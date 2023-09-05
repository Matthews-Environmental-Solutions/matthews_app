import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, forkJoin, map, retry, switchMap, throwError } from "rxjs";
import { Facility } from "../models/facility.model";
import { Device } from "../models/device.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class I4connectedService {

    apiUrl: string = environment.i4connectedApiUrl;

    constructor(public httpClient: HttpClient) { }

    getSites(): Observable<Facility[]> {
        return this.httpClient.get<Facility[]>(`${this.apiUrl}/api/sites/list`)
            .pipe(retry(1), catchError(this.handleError));
    }

    getSite(id: string): Observable<Facility> {
        return this.httpClient.get<Facility>(`${this.apiUrl}/api/sites/${id}/details`)
            .pipe(retry(1), catchError(this.handleError));
    }

    getDevicesByFacility(facilityId: string): Observable<any> {
        return this.httpClient.get<string[]>(`${this.apiUrl}/api/devices/find?siteIds=${facilityId}`)
            .pipe(
                switchMap((listOfDevicesIds: string[]) => {
                    const obs: Observable<Device>[] = listOfDevicesIds.map(deviceId =>
                        this.httpClient.get<Device>(`${this.apiUrl}/api/devices/${deviceId}/details`)
                    );

                    return forkJoin(obs).pipe(
                        map((devices: Device[]) => {
                            let objs: Device[] = [];
                            devices.forEach(d => objs.push(new Device(d.id, d.alias, d.adapterId, 0)));

                            return objs.filter(d => d.adapterId != null);
                            // return objs;
                        })
                    );
                })
            );
    }

    getDevicesByFacility2(facilityId: string): Observable<any> {
        return this.httpClient.post<Device[]>(`${this.apiUrl}/api/devices/list?pageSize=1000000&pageNumber=1&sortFields=0`,
            {
                "selectedItems": [
                    {
                        "id": facilityId,
                        "type": 2
                    }
                ]
            });
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