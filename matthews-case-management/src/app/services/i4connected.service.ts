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
                            devices.forEach(d => objs.push(new Device (d.id, d.alias, d.adapterId, 0)));

                            return objs.filter(d => d.adapterId != null);
                        })
                    );
                })
            );



        // tap((listOfDevicesIds: string[]) => {
        //     console.log(listOfDevicesIds);

        //     const obs: Observable<string>[] = listOfDevicesIds.map(deviceId => {
        //         return this.httpClient.get<string>(`${this.apiUrl}/api/devices/${deviceId}/name`);
        //     });

        //     return forkJoin(obs).pipe(
        //         map((deviceNames: string[]) => {
        //             let device = new Device();
        //             const obj = new Map();

        //             deviceNames.forEach((deviceName, index) => {
        //                 obj.set(obs[index], deviceName);
        //             });

        //             return obj;
        //         })
        //     );
        // }),

        // mergeMap((listOfDevicesIds: string[]) => {
        //     console.log(listOfDevicesIds);
        // })
        // mergeMap((listOfDevicesIds: string[]) => {

        //     // console.log('devices', listOfDevicesIds);

        //     // const obs: Observable<string[]> = listOfDevicesIds.map(deviceId => {
        //     //     return this.httpClient.get<string>(`${this.apiUrl}/api/devices/${deviceId}/name`);
        //     // });

        //     // return forkJoin(obs).pipe(
        //     //     map(deviceNames: string[] => {
        //     //         const obj = new Device();
        //     //         return obj;
        //     //     })
        //     // );
        // })


        // ).subscribe(nesto => console.log('nesto', nesto));

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