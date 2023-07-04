/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { environment } from '../../environments/environment';
import { Timestamp } from 'rxjs/internal/operators/timestamp';

@Injectable({
  providedIn: 'root'
})
export class CremationProcessService {

  constructor(
    private httpService: AuthHttpService
  ) { }

  public getSignalId(signalName: string, deviceName: string)  {
    return this.httpService.request<string>('GET', environment.i4connectedApiUrl + '/signals/' + signalName + '/' + deviceName + '/getId');
  }

  public writeSignalValue(signalId: string, signalValue: number) {
    const date = new Date().toISOString();
    return this.httpService.request<string>('POST', environment.i4connectedApiUrl + '/signals/' + signalId + '/write',
    {
      SignalId: signalId,
      Timestamp: date,
      Value: signalValue
    });
  }

  public getPrimaryChamberTemperature(deviceName: string) {

  }

  public getSecondaryChamberTemperature(deviceName: string) {

  }


}
