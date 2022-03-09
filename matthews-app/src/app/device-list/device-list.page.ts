import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { SignalRService } from '../core/signal-r.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
})
export class DeviceListPage implements OnInit {

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
        this.appStore.getDeviceList(facilityId);
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

  updateSelectedCremator(crematorId: string, crematorName: string) {
    this.appStore.updateSelectedCrematorName(crematorName);
    this.navCtrl.navigateForward(['/app/tabs/facility/device/', crematorId]);
  }

  navigateToDetailsPage($event, deviceId: string) {
    $event.stopPropagation();
    this.navCtrl.navigateForward(['/app/tabs/facility/device/'+ deviceId + '/device-details']);
  }
}
