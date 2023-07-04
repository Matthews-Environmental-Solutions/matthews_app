/* eslint-disable prefer-const */
/* eslint-disable no-trailing-spaces */
/* eslint-disable curly */
/* eslint-disable one-var */
/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, OnInit } from '@angular/core';
import { Case } from './case';
import { AppStoreService } from '../app.store.service';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { CaseStatuses, ContainerSize, ContainerType, GenderType } from '../core/enums';
import { Device } from '../device-list/device';

@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {
  @Input() selectedCase: Case;

  genders = GenderType;
  containerTypes = ContainerType;
  containerSizes = ContainerSize;
  caseStatuses = CaseStatuses;

  genderTypeKeys = Object.keys(GenderType).filter(
    (x) => parseInt(x, 10) >= 0
  );
  containerTypeKeys = Object.keys(ContainerType).filter(
    (x) => parseInt(x, 10) >= 0
  );
  containerSizeKeys = Object.keys(ContainerSize).filter(
    (x) => parseInt(x, 10) >= 0
  );
  caseStatusesKeys = Object.keys(CaseStatuses).filter(
    (x) => parseInt(x, 10) >= 0
  );

  userInfo$ = this.caseStore.userInfo$;
  currentDateTime: any;
  deviceList$ = this.caseStore.deviceList$;
  selectedDevice: Device;

  constructor(
    private caseStore: AppStoreService,
    private modalCtrl: ModalController,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.caseStore.getDeviceList(this.selectedCase.scheduledFacility);
    //console.log('SELECTED CASE:' + JSON.stringify(this.selectedCase));
  }

  selectedDeviceChanged($event) {
    this.selectedCase.scheduledDevice = $event.target.value;
  }

  onSubmit() {
    if (!this.selectedCase.id) {
      this.updateDeviceAlias(this.selectedCase);
      this.caseStore.createCase(this.selectedCase);

      this.selectedCase.scheduledStartTime = this.formatDateAndTime(this.selectedCase.scheduledStartTime);
      this.selectedCase.createdTime = this.formatDateAndTime(new Date().toString());
      
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
      this.selectedCase.scheduledDeviceAlias = devices.find(
        (device) => device.id === selectedCase.scheduledDevice
      ).alias;
    });
  }

  formatDateAndTime(date: string): string {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = '' + d.getHours(),
      minute = '' + d.getMinutes(),
      second = '' + d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;
    if (second.length < 2) second = '0' + second;

    return (
      year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second
    );
  }
}
