import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IDevice } from '../device-details/device';
import { IFacility } from '../facility/facility';
import { Device } from './device';
import { DeviceListService } from './device-list.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
})
export class DeviceListPage implements OnInit {

  facility$: Observable<IFacility>;
  showSearchbar: boolean;
  searchTerm: string;
  sub: Subscription;
  deviceIds: string[] = [];
  devices: Device[] = [];

  constructor(private route: ActivatedRoute, private deviceListService: DeviceListService) { }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if(id) {
      this.deviceListService.getDeviceIdsByStateId(id).then(
        (response: any) => {
          this.deviceIds = response;
          console.log('DEVICE IDS =====> ' + JSON.stringify(this.deviceIds));
          this.getDevices(this.deviceIds);
        }
      ).catch((error: any) => {
        console.log(error);
      });
    }
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }
  getDevices(deviceIds: string[])
  {
    for(const id of deviceIds)
    {
      this.deviceListService.getDeviceNameById(id).then(
        (name: any) => {
          this.devices.push({id, name});
        }
      ).catch((error: any) => {
        console.log(error);
      });
    }
    console.log('DEVICES =====> ' + JSON.stringify(this.devices));
  }


}
