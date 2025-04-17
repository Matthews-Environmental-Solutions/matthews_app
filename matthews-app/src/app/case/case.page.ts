/* eslint-disable max-len */
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
import {
  CaseStatuses,
  ContainerType,
  GenderType,
} from '../core/enums';
import { Device } from '../device-list/device';
import {
  ContainerTypeSelection,
  GenderSelection,
} from './selection-option';
import { FacilityStatusService } from './facility-status.service';
import { FacilityStatus } from './facility-status.model';
import { skip } from 'rxjs/operators';

@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {
  @Input() selectedCase: Case;
  @Input() fromProcess = false;

  newCase = new Case();

  genders: GenderSelection[] = [
    { id: 0, name: 'Male' },
    { id: 1, name: 'Female' },
    { id: 2, name: 'Other' },
  ];
  containerTypes: ContainerTypeSelection[] = [
    { id: 0, name: 'None' },
    { id: 1, name: 'Cardboard' },
    { id: 2, name: 'Hardwood' },
    { id: 3, name: 'MDF Particle board' },
    { id: 4, name: 'Bag/Shroud' },
    { id: 5, name: 'Other' },
  ];
  caseStatuses = CaseStatuses;
  selectedFacility: string;
  userInfo$ = this.caseStore.userInfo$;
  currentDateTime: any;
  deviceList$ = this.caseStore.deviceList$;
  selectedDevice: Device;
  facilityStatuses: FacilityStatus[] = [];

  private guidEmpty = '00000000-0000-0000-0000-000000000000';
  private dateTimeMin = '0001-01-01T00:00:00';

  constructor(
    private caseStore: AppStoreService,
    private modalCtrl: ModalController,
    private facilityStatusService: FacilityStatusService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.caseStore.selectedFacility$.subscribe((sf) => {
      this.selectedFacility = sf.id;
      this.facilityStatusService
        .getAllStatusesByFacility(this.selectedFacility)
        .then((data) => {
          this.facilityStatuses = data;
        });
    });
    this.newCase.scheduledStartTime = this.formatDateAndTime(
      new Date().toString()
    );
    if (this.fromProcess) {
      this.caseStore.selectedFacility$.subscribe(
        (s) => (this.selectedFacility = s.id)
      );
    }
    this.caseStore.getDeviceList(this.selectedCase.scheduledFacility);
    if (this.selectedCase.id !== '' && this.selectedCase.id !== undefined)
      this.mapCase();
  }

  mapCase() {
    this.newCase.id = this.selectedCase.id;
    this.newCase.clientCaseId = this.selectedCase.clientCaseId;
    this.newCase.firstName = this.selectedCase.firstName;
    this.newCase.lastName = this.selectedCase.lastName;
    this.newCase.weight = this.selectedCase.weight;
    this.newCase.age = this.selectedCase.age;
    this.newCase.gender = this.selectedCase.gender;
    this.newCase.genderText = this.genders[this.selectedCase.gender].name;
    this.newCase.containerType = this.selectedCase.containerType;
    this.newCase.containerTypeText =
      this.containerTypes[this.selectedCase.containerType].name;
    this.newCase.status = this.selectedCase.status;
    this.newCase.scheduledDevice = this.selectedCase.scheduledDevice;
    this.newCase.scheduledStartTime = this.selectedCase.scheduledStartTime;
    this.newCase.facilityStatusId = this.selectedCase.facilityStatusId;
    this.newCase.physicalId = this.selectedCase.physicalId;
    this.newCase.selected = this.selectedCase.selected;
    //console.log(this.newCase.gender + ':' + this.newCase.genderText);
  }

  selectedDeviceChanged($event) {
    this.newCase.scheduledDevice = $event.target.value;
  }

  onSubmit() {
    if (!this.newCase.id || this.newCase.id.length < 1) {
      //this.updateDeviceAlias(this.newCase);
      this.newCase.gender = +this.newCase.gender;
      this.newCase.containerType = +this.newCase.containerType;
      this.newCase.genderText = this.genders[this.newCase.gender].name;
      this.newCase.containerTypeText =
        this.containerTypes[this.newCase.containerType].name;
      if (!this.fromProcess) {
        this.newCase.scheduledFacility = this.selectedCase.scheduledFacility;
      }
      this.newCase.physicalId = this.newCase.physicalId;
      this.newCase.createdTime = this.formatDateAndTime(new Date().toString());

      if (this.fromProcess) {
        this.newCase.scheduledDevice = this.selectedCase.scheduledDevice;
        this.newCase.scheduledFacility = this.selectedFacility;
      }

      this.updateDeviceAlias(this.newCase);

      if (
        this.newCase.scheduledDevice === this.guidEmpty ||
        this.newCase.scheduledStartTime === this.dateTimeMin ||
        this.newCase.scheduledFacility === this.guidEmpty ||
        this.newCase.scheduledStartTime == null
      ) {
        this.newCase.status = 0; //unscheduled
      }

      if (
        this.newCase.scheduledDevice != this.guidEmpty &&
        this.newCase.scheduledStartTime != this.dateTimeMin &&
        this.newCase.scheduledFacility != this.guidEmpty &&
        this.newCase.scheduledStartTime != null
      ) {

        const selectedFacilityStatus = this.facilityStatuses.find(
          (fs) => fs.status == 3
        );

        this.newCase.facilityStatusId = selectedFacilityStatus.id;

        // if (selectedFacilityStatus?.startProcess) {
        //   this.newCase.status = 3; // Ready to cremate
        // }
      }

      if (this.fromProcess) {
        this.newCase.selected = true;
      }

      if (this.fromProcess) {
        this.caseStore.createCaseFromProcess(this.newCase);
      } else {
        this.caseStore.createCase(this.newCase);
      }

      console.log(this.newCase);
    } else {
      this.updateDeviceAlias(this.newCase);
      this.newCase.gender = +this.newCase.gender;
      this.newCase.containerType = +this.newCase.containerType;
      this.newCase.genderText = this.genders[this.newCase.gender].name;
      this.newCase.containerTypeText =
        this.containerTypes[this.newCase.containerType].name;
      this.newCase.status = +this.newCase.status;
      this.newCase.scheduledFacility = this.selectedCase.scheduledFacility;
      this.newCase.physicalId = this.newCase.physicalId;
      this.newCase.createdTime = this.formatDateAndTime(new Date().toString());

      if (
        this.newCase.scheduledDevice === this.guidEmpty ||
        this.newCase.scheduledStartTime === this.dateTimeMin ||
        this.newCase.scheduledFacility === this.guidEmpty ||
        this.newCase.scheduledStartTime == null
      ) {
        this.newCase.status = 0; //unscheduled
      }

      if (
        this.newCase.scheduledDevice != this.guidEmpty &&
        this.newCase.scheduledStartTime != this.dateTimeMin &&
        this.newCase.scheduledFacility != this.guidEmpty &&
        this.newCase.scheduledStartTime != null
      ) {
        this.newCase.status = 4; // waiting for permit

        const selectedFacilityStatus = this.facilityStatuses.find(
          (fs) => fs.id == this.newCase.facilityStatusId
        );

        // if (selectedFacilityStatus?.startProcess) {
        //   this.newCase.status = 3; // Ready to cremate
        // }
      }

      this.caseStore.updateCase(this.newCase);

      console.log(this.newCase);
    }
    this.close();
  }

  async close() {
    const modal = await this.modalCtrl.getTop();
    if (modal) {
      await modal.dismiss();
    }
  }
  

  updateDeviceAlias(newCase: Case) {
    this.deviceList$.subscribe((devices) => {
      let foundDevice = devices.find(
        (device) => device.id === newCase.scheduledDevice
      );
      this.newCase.scheduledDeviceAlias = foundDevice?.alias;
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

  trimLastName() {
    if (this.newCase.lastName) {
      this.newCase.lastName = this.newCase.lastName.trim();
    }
  }
  
  trimFirstName() {
    if (this.newCase.firstName) {
      this.newCase.firstName = this.newCase.firstName.trim();
    }
  }

  trimClientCaseId() {
    if (this.newCase.clientCaseId) {
      this.newCase.clientCaseId = this.newCase.clientCaseId.trim();
    }
  }
  
  trimPhysicalId() {
    if (this.newCase.physicalId) {
      this.newCase.physicalId = this.newCase.physicalId.trim();
    }
  }

}
