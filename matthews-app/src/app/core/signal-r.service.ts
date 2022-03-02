/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
declare let $: any;

@Injectable({
  providedIn: 'root'
})

export class SignalRService {

  constructor(private authService: AuthService) {}

  public initializeSignalRConnection(signalId: string, func: (measurement) => void): void {
    const signalRServerEndPoint = 'https://matthewscremation.i4connected.cloud/api/signalr';
    const connection = $.hubConnection(signalRServerEndPoint);
    this.getAccessToken().then((token) => {
      connection.qs = { access_token: token };
      const proxy = connection.createHubProxy('measurementHub');
      proxy.on('onMeasurement', func);

      connection.start().done(() => {
          console.log('Connected to Measurement Hub');
          proxy.invoke('Subscribe', signalId)
            .done((measurement) => {
                console.log(measurement);
              });
        }).fail((error) => {
            console.log('Measurement Hub error -> ' + error);
          });
    });
  }

  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    return token.accessToken;
  }
}
