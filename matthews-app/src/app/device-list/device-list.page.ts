/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { MachineStatus } from '../core/enums';
import { SignalRService } from '../core/signal-r.service';
import { Device } from './device';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
})
export class DeviceListPage implements OnInit, OnDestroy {
  machineStatus = MachineStatus;
  showSearchbar: boolean;
  searchTerm: string;
  deviceIds: string[] = [];
  deviceListVm$ = this.appStore.deviceListVm$;
  devices$ = this.appStore.deviceList$;
  selectedFacility$ = this.appStore.selectedFacility$;

  // eslint-disable-next-line max-len
  constructor(private route: ActivatedRoute, private appStore: AppStoreService, private navCtrl: NavController, private signalRService: SignalRService) { }

  ngOnInit() {
    const facilityId = this.route.snapshot.paramMap.get('id');
    //this.appStore.getDevices();
    this.signalRService.initializeSignalRConnection().then((response) => {
      response.start().done(() => {
        console.log('Connection started!');
        this.appStore.getDeviceListWithSignalR(facilityId);
        //this.loadingService.dismiss();
      }).catch((error: any) => {
        console.log(error);
      });
    });
  }

  ngOnDestroy() {
    this.signalRService.stopConnection();
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  deviceHasMachineStatus(device: Device): boolean {
    // Check if the device has the 'MACHINE_STATUS' signal with a non-null value
    return device.signals && device.signals.some(signal => signal.name === 'MACHINE_STATUS' && signal.value !== null && signal.value !== undefined);
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
