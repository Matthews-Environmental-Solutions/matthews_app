/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
import { LoadingService } from './loading.service';
declare let $: any;

export interface Measurement {
  signalId: string;
  signalName: string
 // timestamp: Date
  value: string;
}

@Injectable({
  providedIn: 'root'
})

export class SignalRService {
  public proxy: any;
  private connection: any;
  private waitedAnswer: Measurement;

  constructor(private authService: AuthService, private loadingService: LoadingService) { }

  public initializeSignalRConnection(): void {
    this.loadingService.present();
    const signalRServerEndPoint = 'https://matthewscremation.i4connected.cloud/api/signalr';
    this.connection = $.hubConnection(signalRServerEndPoint);
    //this.connection.logging = true;
    this.getAccessToken().then((token) => {
      this.connection.qs = { access_token: token };
      this.proxy = this.connection.createHubProxy('measurementHub');
      this.startConnection();
    });
  }

  public startConnection(){
    this.connection.start().done(() => {
      console.log("Connection started!");
      this.loadingService.dismiss();
    }).catch((error: any) => {
      console.log(error);
    });
  }

  public addListener( func: (measurement) => void) : void {
    console.log("addListener");
    this.proxy.on('onMeasurement', func);
  }

  public subscribeToSignalValues(signalId: string[]) {
    console.log("subscribeToSignalValues");
    this.proxy.invoke('SubscribeAll', signalId)
            .done((measurement) => {
                console.log('SubscribeAll:  =>' + JSON.stringify(measurement));
              });
  }

  public readValueFromSignal(signalId: string) {
    console.log("readValueFromSignal");
    this.proxy.invoke('Read', signalId)
            .done((measurement) => {
                console.log(measurement);
              });
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
