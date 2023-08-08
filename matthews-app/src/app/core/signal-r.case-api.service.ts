/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
import { LoadingService } from './loading.service';
import * as signalR from '@microsoft/signalr';
import { AppStoreService } from '../app.store.service';
declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class SignalRCaseApiService {
  public proxy: any;
  private hubConnection!: signalR.HubConnection;

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private appStore: AppStoreService
  ) {}

  public initializeSignalRCaseApiConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://develop.comdata.rs/MatthewsApp.API/casehub')
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started'))
      .catch((err) =>
        console.log('Error while starting SignalR connection: ' + err)
      );
  }

  public stopConnection() {
    this.hubConnection.stop();
    console.log('Connection Case Api SignalR stopped!');
  }

  public addCaseDataListener = (facilityId: string) => {
    this.hubConnection.on('refreshcaseslist', (data) => {
      this.appStore.getCases(facilityId);
      console.log(data);
    });
  };

  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    return token.accessToken;
  }
}
