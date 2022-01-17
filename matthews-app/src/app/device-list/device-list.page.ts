import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AppStoreService } from '../app.store.service';
import { Facility } from '../facility/facility';
import { Device } from './device';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
})
export class DeviceListPage implements OnInit {

  facility$: Observable<Facility>;
  showSearchbar: boolean;
  searchTerm: string;
  sub: Subscription;
  deviceIds: string[] = [];
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


}
