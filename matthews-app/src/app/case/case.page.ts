import { Component, Input, OnInit } from '@angular/core';
import { Case } from './case';
import { AppStoreService } from '../app.store.service';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { CaseStatuses, ContainerSize, ContainerType } from '../core/enums';
import { Device } from '../device-list/device';



@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {

  @Input() selectedCase: Case;

  genders: string[] = [
    'Female',
    'Male'
  ];

  containerTypes = ContainerType;
  containerSizes = ContainerSize;
  containerTypeKeys =  Object.keys(ContainerType).filter(x => (parseInt(x, 10) >= 0));
  containerSizeKeys = Object.keys(ContainerSize).filter(x => (parseInt(x, 10) >= 0));
  caseStatuses = CaseStatuses;
  caseStatusesKeys = Object.keys(CaseStatuses).filter(x => (parseInt(x, 10) >= 0));
  userInfo$ = this.caseStore.userInfo$;
  currentDateTime: any;
  deviceList$ = this.caseStore.deviceList$;
  selectedDevice: Device;

  constructor(private caseStore: AppStoreService, private modalCtrl: ModalController, private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.caseStore.getDeviceList(this.selectedCase.facilityId);
    console.log("SELECTED CASE:" + JSON.stringify(this.selectedCase));
  }

  selectedDeviceChanged($event){
    this.selectedCase.selectedDevice = $event.target.value;
  }

  onSubmit() {
    if(!this.selectedCase.id) {
      this.updateDeviceAlias(this.selectedCase);
      this.caseStore.createCase(this.selectedCase);
      this.selectedCase.createdTime = new Date((new Date()).toISOString());
      console.log(this.selectedCase);
    } else {
      this.updateDeviceAlias(this.selectedCase);
      this.caseStore.updateCase(this.selectedCase);
      console.log(this.selectedCase);

    }
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  updateDeviceAlias(selectedCase: Case) {
    this.deviceList$.subscribe((devices) => {
      this.selectedCase.selectedDeviceAlias = devices.find(device => device.id == selectedCase.selectedDevice).alias;
    });
  }
}
