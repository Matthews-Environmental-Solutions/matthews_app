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

  public getPrimaryChamberTemperature(deviceName: string) {

  }

  public getSecondaryChamberTemperature(deviceName: string) {

  }
}
