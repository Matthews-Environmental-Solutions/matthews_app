import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStoreService } from '../app.store.service';
import { AshCoolingStatus, AshRemovalStatus, ChamberStatus, EmissionsStatus, MachineStatus } from '../core/enums';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.page.html',
  styleUrls: ['./device-details.page.scss'],
})
export class DeviceDetailsPage implements OnInit {
  deviceId = this.route.snapshot.paramMap.get('id');
  deviceName = this.route.snapshot.paramMap.get('name');
  chamberStatus = ChamberStatus;
  machineStatus = MachineStatus;
  ashCoolingStatus = AshCoolingStatus;
  ashRemovalStatus = AshRemovalStatus;
  emissionsStatus = EmissionsStatus;
  deviceListVm$ = this.appStore.deviceListVm$;

  constructor(private route: ActivatedRoute, private appStore: AppStoreService) { }

  ngOnInit() {
    this.deviceListVm$.subscribe((response) => {
      console.log(response);
    });
  }

}
