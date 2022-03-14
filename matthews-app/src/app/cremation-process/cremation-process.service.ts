import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CremationProcessService {

  constructor(
    private httpService: AuthHttpService
  ) { }

  public getSignalId(signalName: string, deviceName: string)  {
    return this.httpService.request<string>("GET", environment.i4connectedApiUrl + "/signals/" + signalName + "/" + deviceName + "/getId");
  }

  public writeSignalValue(signalId: string, signalValue: number) {
    return this.httpService.request<string>("POST", environment.i4connectedApiUrl + "/signals/" + signalId + "/write",
    {
      "SignalId": signalId,
      "Timestamp": new Date().toUTCString,
      "Value": signalValue
    });
  }

  public getPrimaryChamberTemperature(deviceName: string) {

  }

  public getSecondaryChamberTemperature(deviceName: string) {

  }


}
