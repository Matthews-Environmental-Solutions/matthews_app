/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../app.store.service';
import { ModalController } from '@ionic/angular';
import { Case } from '../case/case';
import { CaseStatuses } from '../core/enums';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss']
})
export class SchedulePage implements OnInit {
  showSearchbar: boolean;
  searchTerm: string;
  selectedFacilityId: string;
  scheduleVm$ = this.caseStore.scheduleVm$;
  defaultFacilityId: any;
  caseStatus = CaseStatuses;

  constructor(private caseStore: AppStoreService, public modalController: ModalController) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.setDefaultValues();
  }

  deleteCase(selectedCase: Case) {
    this.caseStore.deleteCase(selectedCase);
  }

  selectedFacilityChanged($event){
    this.selectedFacilityId = $event.target.value;
    this.caseStore.getCases(this.selectedFacilityId);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  presentModal(selectedCase?: Case) {
    this.caseStore.openCaseModal(selectedCase ?
      { ...selectedCase, scheduledFacility: this.selectedFacilityId ?? this.defaultFacilityId } :
      { scheduledFacility : this.selectedFacilityId ?? this.defaultFacilityId } as Case);
  }

  setDefaultValues() {
    this.caseStore.scheduleVm$.subscribe(result => {
      this.defaultFacilityId = result.facilities[0].id;
    });

    this.caseStore.getCases(this.defaultFacilityId);
  }
}
