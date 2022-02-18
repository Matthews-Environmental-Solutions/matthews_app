import { Component, Input, OnInit } from '@angular/core';
import { Case } from './case';
import { AppStoreService } from '../app.store.service';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

export enum ContainerType {
  cardboard,
  fiberboard,
  hardwood,
  none,
}

export enum ContainerSize {
  child,
  standard,
  bariatric
}

export enum CaseStatuses {
  waitingForPermits,
  readyToCremate
}

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

  constructor(private caseStore: AppStoreService, private modalCtrl: ModalController, private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.caseStore.getDeviceList(this.selectedCase.facilityId);
    console.log("SELECTED CASE:" + JSON.stringify(this.selectedCase));
  }

  onSubmit() {
    if(!this.selectedCase.id) {
      this.caseStore.createCase(this.selectedCase);
      this.currentDateTime = this.datePipe.transform((new Date), 'MM/dd/yyyy h:mm:ss');
    } else {
      this.caseStore.updateCase(this.selectedCase);
    }
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
