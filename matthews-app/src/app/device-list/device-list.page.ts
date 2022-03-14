import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { SignalRService } from '../core/signal-r.service';

export enum MachineStatus {
  shutdown = 0,
  preheat = 10,
  idle = 20,
  cremation = 30,
  rake = 40,
  cooldown = 50,
  curing = 60,
  emergencyBypass = 70
}

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
})
export class DeviceListPage implements OnInit {
  machineStatus = MachineStatus;
  showSearchbar: boolean;
  searchTerm: string;
  deviceIds: string[] = [];
  deviceListVm$ = this.appStore.deviceListVm$;
  devices$ = this.appStore.deviceList$;
  selectedFacility$ = this.appStore.selectedFacility$;

  constructor(private route: ActivatedRoute, private appStore: AppStoreService, private navCtrl: NavController, private signalRService: SignalRService) { }

  ngOnInit() {
    const facilityId = this.route.snapshot.paramMap.get('id');
    //this.appStore.getDevices();
    this.signalRService.initializeSignalRConnection().then((response) => {
      response.start().done(() => {
        console.log("Connection started!");
        this.appStore.getDeviceListWithSignalR(facilityId);
        //this.loadingService.dismiss();
      }).catch((error: any) => {
        console.log(error);
      });
    })


  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  updateSelectedCremator(deviceId: string) {
    this.appStore.updateSelectedDevice(deviceId);
    this.navCtrl.navigateForward(['/app/tabs/facility/device/', deviceId]);
  }

  navigateToDetailsPage($event, deviceId: string, deviceName: string) {
    $event.stopPropagation();
    this.appStore.updateSelectedDevice(deviceId);
    this.navCtrl.navigateForward(['/app/tabs/facility/device/device-details/', deviceId, deviceName]);
  }

  stopSignalRConnection()
  {
    this.signalRService.stopConnection();
  }
}
