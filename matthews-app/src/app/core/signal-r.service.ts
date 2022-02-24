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

  public initializeSignalRConnection(): void {
    const signalRServerEndPoint = 'https://matthewscremation.i4connected.cloud/api/signalr';
    const connection = $.hubConnection(signalRServerEndPoint);
    this.getAccessToken().then((token) => {
      connection.qs = { access_token: token };
      const proxy = connection.createHubProxy('measurementHub');
      proxy.on('onMeasurement', this.onMessageReceived);

      connection.start().done(() => {
          console.log('Connected to Measurement Hub');
          proxy.invoke('Subscribe', 'bbb709ea-4db7-4a9c-80d0-c45b10d137a5')
            .done((measurement) => {
                console.log(measurement);
              });
        }).fail((error) => {
            console.log('Notification Hub error -> ' + error);
          });
    });
  }

  private onMessageReceived(measurement: any) {
    console.log('New message received from Server: ' + measurement);
  }

  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    return token.accessToken;
  }

}
