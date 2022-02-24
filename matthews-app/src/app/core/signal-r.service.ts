import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private connection: any;
  private proxy: any;

  constructor(private authService: AuthService) {}
  //public data: DataModelFromAPI[];

  // private hubConnection: signalR.HubConnection;

  public initializeSignalRConnection(): void {
    let signalRServerEndPoint = 'https://matthewscremation.i4connected.cloud/api/signalr';
    this.connection = $.hubConnection(signalRServerEndPoint);
    this.proxy = this.connection.createHubProxy('measurementHub');

    this.proxy.on('OnMeasurement', 'bbb709ea-4db7-4a9c-80d0-c45b10d137a5', (serverMessage) => this.onMessageReceived(serverMessage));
    this.connection.logging = true;
    this.connection.start().done((data: any) => {
      console.log('Connected to Measurement Hub');
      this.proxy.invoke('Subscribe', 'bbb709ea-4db7-4a9c-80d0-c45b10d137a5' );

              //this.broadcastMessage();
      }).catch((error: any) => {
              console.log('Notification Hub error -> ' + error);
      });
    }

  private onMessageReceived(serverMessage: string) {
    console.log('New message received from Server: ' + serverMessage);
  }

 private broadcastMessage(): void {
  this.proxy.invoke('NotificationService', 'text message')
     .catch((error: any) => {
         console.log('broadcastMessage error -> ' + error);
      });
    }

  // public startConnection = () => {

  //   this.hubConnection = new signalR.HubConnectionBuilder()
  //   .withUrl('https://matthewscremation.i4connected.cloud/api/signalr', {
  //     accessTokenFactory: () => this.getAccessToken()
  //   })
  //   .build();


  //   this.hubConnection
  //   .start()
  //   .then(() => console.log("Connection started"))
  //   .catch(err => console.log("Error while starting connection: " + err))
  // }

  // public addTemperatureDataListener = () => {
  //   this.hubConnection.on('measurementHub', (data) => {
  //    // this.data = data;
  //     console.log(data);
  //   })
  // }

  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    console.log(JSON.stringify(token));
    return token.accessToken;
  }

}
