/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
import { LoadingService } from './loading.service';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';
declare let $: any;

export interface Measurement {
  signalId: string;
  signalName: string;
  // timestamp: Date
  value: string;
}

export interface Alarm {
  id: string;
  eventId: string;
  description: string;
  name: string
  end: string;
}

@Injectable({
  providedIn: 'root'
})

export class SignalRService {
  public proxyMeasurement: any;
  public proxyEvent: any;
  private connection: any;

  constructor(private authService: AuthService, 
    private loadingService: LoadingService, 
    private notificationService: NotificationService) { }

  public async initializeSignalRConnection(): Promise<any> {
    const signalRServerEndPoint = `${environment.i4connectedApiUrl}/signalr`;
    this.connection = $.hubConnection(signalRServerEndPoint);
    await this.getAccessToken().then((token) => {
      this.connection.qs = { access_token: token };
      this.proxyMeasurement = this.connection.createHubProxy('measurementHub');
      this.proxyEvent = this.connection.createHubProxy('eventHub');
  
      this.proxyEvent.on('*', (eventName, data) => {
        console.log(`📩 Received event: ${eventName}`, data);
  
        if (eventName === 'OnEventUpdate') {
          console.log('✅ Extracted Event Data:', data);
        }
      });
    });
  
    return this.connection;
  }
  

  // public startConnection() {
  //   this.connection.start().done(() => {
  //     console.log('Connection started!');
  //     this.loadingService.dismiss();
  //   }).catch((error: any) => {
  //     console.log(error);
  //   });
  // }

  public async startConnection() {
    await this.connection.start().done(async () => {
      console.log('Connection started!');
      await this.loadingService.dismiss(); // Dismiss the loader
      this.addListenerEventUpdate((event) => {
        console.log('Received OnEventUpdate:', event);
      });
    }).catch((error: any) => {
      console.log('Connection error:', error);
    });
  }



  public addListenerMeasurement(func: (measurement) => void): void {
    console.log('addMeasurementListener');
    this.proxyMeasurement.on('onMeasurement', func);
  }

  public addListenerEventUpdate(func: (event) => void): void {
    console.log('addEventUpdateListener');
    this.proxyEvent.on('OnEventUpdate', func);
  }

  public subscribeToSignalValues(signalId: string[]) {
    console.log('subscribeToSignalValues');
    this.proxyMeasurement.invoke('SubscribeAll', signalId)
      .done((measurement) => {
        console.log('SubscribeAll:  =>' + JSON.stringify(measurement));
      });
  }

  public readValueFromSignal(signalId: string) {
    console.log('readValueFromSignal');
    this.proxyMeasurement.invoke('Read', signalId)
      .done((measurement) => {
        console.log(measurement);
      });
  }

  public stopConnection() {
    this.connection.stop();
    console.log('Connection stopped!');
  }

  // public initializeSignalRConnection(signalId: string, func: (measurement) => void): void { //
  //   const signalRServerEndPoint = 'https://matthewscremation.i4connected.cloud/api/signalr';
  //   const connection = $.hubConnection(signalRServerEndPoint);
  //   this.getAccessToken().then((token) => {
  //     connection.qs = { access_token: token };
  //     this.proxy = connection.createHubProxy('measurementHub');
  //     //proxy.on('onMeasurement', func);

  //     connection.start().done(() => {
  //         console.log('Connected to Measurement Hub');
  //         this.proxy.invoke('Subscribe', signalId)
  //           .done((measurement) => {
  //               console.log(measurement);
  //               // this.receivedVaules$.next(measurement);
  //               // this.receivedVaules$.asObservable().subscribe((res) => {
  //               //   func.call(res);
  //               //   console.log("AAAAAAA" + JSON.stringify(res));
  //               // })
  //             });
  //       }).fail((error) => {
  //           console.log('Measurement Hub error -> ' + error);
  //         });
  //   });
  // }

  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    return token.accessToken;
  }
}
