/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { TokenResponse } from '@openid/appauth';
import { LoadingService } from './loading.service';
import * as signalR from '@microsoft/signalr';
import { AppState, AppStoreService } from '../app.store.service';
import { CaseService } from '../case/case.service';
import { environment } from '../../environments/environment';
import { FacilityService } from '../facility/facility.service';
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
    private caseService: CaseService,
    private facilityService: FacilityService
  ) { }

  // public initializeSignalRCaseApiConnection() {
  //   this.hubConnection = new signalR.HubConnectionBuilder()
  //     .withUrl(`${environment.apiUrl}/casehub`)
  //     .build();
  //   this.hubConnection
  //     .start()
  //     .then(() => console.log('SignalR Case Api connection started'))
  //     .catch((err) =>
  //       console.log('Error while starting SignalR connection: ' + err)
  //     );
  // }

  public initializeSignalRCaseApiConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/casehub`)
      .withAutomaticReconnect() // Enables automatic reconnect
      .build();

    this.hubConnection.serverTimeoutInMilliseconds = 60000;

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Case API connection started'))
      .catch((err) =>
        console.log('Error while starting SignalR connection: ' + err)
      );

    // Optionally handle reconnect events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR connection lost. Attempting to reconnect...');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR connection reestablished.');
    });

    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed.', error);
    });
  }

  setSelectedFacilityFromSchedulePage(facility: string, previousFacilityId?: string): void {
    //previously selected facility id
    
    if (!previousFacilityId || (previousFacilityId && previousFacilityId.trim().length === 0)) {
      this.facilityService.subscribeToGroup(facility).then((response) => {
        console.log(response);
      });
    } else {
      this.facilityService.unsubscribeFromGroup(previousFacilityId)
        .then(
          firstResponse => {
            console.log('First response:', firstResponse);
            return this.facilityService.subscribeToGroup(facility);
          }
        )
        .then((response) => { console.log(response); });
    }
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

  public addSelectedCaseListener() {
    this.hubConnection.on('selectcase', (data: string) => {
      let dataSplited = data.split(';');
      //debugger
      if (dataSplited.length == 4) {
        //debugger
        let splitedCaseId = dataSplited[0].trim().split(':');
        let caseId = splitedCaseId[1].trim();
        let splitedDeviceId = dataSplited[1].trim().split(':');
        let deviceId = splitedDeviceId[1].trim();

        let splitedActualStartTime = dataSplited[2].trim().split(':');
        let actualStartTimeStr = splitedActualStartTime.slice(1).join(':').trim();

        let splitedEndTime = dataSplited[3].trim().split(':');
        let endTime = splitedEndTime[1].trim();

        let deviceIdFromStore = this.appStore.getSelectedDevice();

        if (deviceIdFromStore === deviceId) {
          this.appStore.refreshSelectedCaseId(caseId);
        }

        if (actualStartTimeStr != null && actualStartTimeStr != '') {
          //debugger
          const actualStartTime = new Date(actualStartTimeStr);
          this.appStore.updateActualStartTime(actualStartTime.toISOString());
        }
      }
    });
  };

  public async getAccessToken() {
    const token: TokenResponse = await this.authService.getValidToken();
    return token.accessToken;
  }
}
