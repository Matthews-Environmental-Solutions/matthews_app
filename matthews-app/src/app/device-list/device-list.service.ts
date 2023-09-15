/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */
/* eslint-disable quote-props */
import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { environment } from '../../environments/environment';
import { Device } from './device';
import { Signal } from './signal';

@Injectable({
  providedIn: 'root'
})
export class DeviceListService {

  private productUrl = environment.i4connectedApiUrl + '/api/devices/';

  constructor(
    private httpService: AuthHttpService
  ) { }

getDevices(faiclityd: string)  {

  return this.httpService.request<Device[]>("POST", `${environment.i4connectedApiUrl}/api/devices/list?pageSize=1000000&pageNumber=1&sortFields=0`, {
    "selectedItems": [
      {
        "id": faiclityd,
        "type": 2
      }
    ]
  } );
}

getSignalsForDevice(deviceId: string) {
  return this.httpService.request<Signal[]>("POST", `${environment.i4connectedApiUrl}/api/signals/list?pageSize=1000000&pageNumber=1`, {
    "selectedItems": [
      {
        "id": deviceId,
        "type": 3,
        "name": ""
      }
    ]
  } );
}

  getDeviceIdsByFacilityId(stateId: string) {
    console.log("getDeviceIdByStateId called!");
    return this.httpService.request("GET", `${this.productUrl}find?siteIds=${stateId}` );
  }

  getDeviceNameById(deviceId: string) {
    console.log("getDeviceNameById called!");
    return this.httpService.request("GET", `${this.productUrl}${deviceId}/name` );
  }
}
