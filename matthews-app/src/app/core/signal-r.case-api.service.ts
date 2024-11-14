/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
import { LoadingService } from './loading.service';
import * as signalR from '@microsoft/signalr';
import { AppStoreService } from '../app.store.service';
import { CaseService } from '../case/case.service';
import { environment } from '../../environments/environment';
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
    private appStore: AppStoreService,
    private caseService: CaseService
  ) {}

  public initializeSignalRCaseApiConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/casehub`)
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('SignalR Case Api connection started'))
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
      //this.appStore.getCases(facilityId);
      this.appStore.refreshCaseList();
      console.log(data);
      //this.changeDetectorRef.detectChanges();
    });
  };

  public addSelectedCaseListener = (facilityId: string) => {
    this.hubConnection.on('selectCase', (data) => {
      this.appStore.refreshSelectedCaseId(data);
      console.log(data);
    });
};



  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    return token.accessToken;
  }
}
