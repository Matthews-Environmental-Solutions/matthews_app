/* eslint-disable eqeqeq */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
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

  newCase = new Case();

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
    if (this.selectedCase.id !== '') this.mapCase();
  }

  mapCase() {
    this.newCase.id = this.selectedCase.id;
    this.newCase.clientCaseId = this.selectedCase.clientCaseId;
    this.newCase.firstName = this.selectedCase.firstName;
    this.newCase.lastName = this.selectedCase.lastName;
    this.newCase.weight = this.selectedCase.weight;
    this.newCase.age = this.selectedCase.age;
    this.newCase.gender = this.selectedCase.gender;
    this.newCase.genderText = this.genders[this.newCase.gender];
    this.newCase.containerType = this.selectedCase.containerType;
    this.newCase.containerTypeText = this.selectedCase.containerTypeText;
    this.newCase.containerSize = this.selectedCase.containerSize;
    this.newCase.containerSizeText = this.selectedCase.containerSizeText;
    this.newCase.status = this.selectedCase.status;
    this.newCase.scheduledDevice = this.selectedCase.scheduledDevice;
    this.newCase.scheduledStartTime = this.selectedCase.scheduledStartTime;
    console.log(this.newCase.gender + ':' + this.newCase.genderText);
  }

  selectedDeviceChanged($event) {
    this.newCase.scheduledDevice = $event.target.value;
  }

  onSubmit() {
    if (!this.newCase.id || this.newCase.id.length < 1) {
      this.updateDeviceAlias(this.newCase);
      this.newCase.gender = +this.newCase.gender;
      this.newCase.containerSize = +this.newCase.containerSize;
      this.newCase.containerType = +this.newCase.containerType;
      this.newCase.genderText = this.genders[this.newCase.gender];
      this.newCase.containerSizeText = this.containerSizes[this.newCase.containerSize];
      this.newCase.containerTypeText = this.containerTypes[this.newCase.containerType];
      this.newCase.status = +this.newCase.status;
      this.newCase.scheduledFacility = this.selectedCase.scheduledFacility;
      this.newCase.createdTime = this.formatDateAndTime(new Date().toString());
      this.caseStore.createCase(this.newCase);
      
      console.log(this.newCase);
    } else {
      this.updateDeviceAlias(this.newCase);
      this.newCase.gender = +this.newCase.gender;
      this.newCase.containerSize = +this.newCase.containerSize;
      this.newCase.containerType = +this.newCase.containerType;
      this.newCase.genderText = this.genders[this.newCase.gender];
      this.newCase.containerSizeText = this.containerSizes[this.newCase.containerSize];
      this.newCase.containerTypeText = this.containerTypes[this.newCase.containerType];
      this.newCase.status = +this.newCase.status;
      this.newCase.scheduledFacility = this.selectedCase.scheduledFacility;
      this.newCase.createdTime = this.formatDateAndTime(new Date().toString());
      this.caseStore.updateCase(this.newCase);
      console.log(this.newCase);
    }
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  updateDeviceAlias(newCase: Case) {
    this.deviceList$.subscribe((devices) => {
      this.newCase.scheduledDeviceAlias = devices.find(
        (device) => device.id === newCase.scheduledDevice
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
