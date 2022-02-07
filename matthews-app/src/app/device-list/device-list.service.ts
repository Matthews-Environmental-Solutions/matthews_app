import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeviceListService {

  private productUrl = environment.i4connectedApiUrl + 'devices/';

  constructor(
    private httpService: AuthHttpService
  ) { }

  getDeviceIdsByFacilityId(stateId: string) {
    console.log("getDeviceIdByStateId called!");
    return this.httpService.request("GET", `${this.productUrl}find?siteIds=${stateId}` );
  }

  getDeviceNameById(deviceId: string) {
    console.log("getDeviceNameById called!");
    return this.httpService.request("GET", `${this.productUrl}${deviceId}/name` );
  }
}
