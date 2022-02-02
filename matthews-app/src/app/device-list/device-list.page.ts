import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStoreService } from '../app.store.service';

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

  constructor(private route: ActivatedRoute, private appStore: AppStoreService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.appStore.getDeviceList(id);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  updateSelectedCremator(crematorName: string) {
    this.appStore.updateSelectedCrematorName(crematorName);
  }
}
