import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceListService {

  private productUrl = 'https://matthewscremation.i4connected.cloud/api/api/devices/';

  constructor(
    private httpService: AuthHttpService
  ) { }

  getDeviceIdsByStateId(stateId: string) {
    console.log("getDeviceIdByStateId called!");
    return this.httpService.request("GET", `${this.productUrl}find?siteIds=${stateId}` );
  }

  getDeviceNameById(deviceId: string) {
    console.log("getDeviceNameById called!");
    return this.httpService.request("GET", `${this.productUrl}${deviceId}/name` );
  }
}
