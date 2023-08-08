/* eslint-disable @angular-eslint/component-selector */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppStoreService } from '../app.store.service';
import { AlertController, AlertOptions, ModalController } from '@ionic/angular';
import { Case } from '../case/case';
import { CaseStatuses } from '../core/enums';
import { TranslateService } from '@ngx-translate/core';
import { SignalRCaseApiService } from '../core/signal-r.case-api.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss']
})
export class SchedulePage implements OnInit, OnDestroy {
  showSearchbar: boolean;
  searchTerm: string;
  selectedFacilityId: string;
  scheduleVm$ = this.caseStore.scheduleVm$;
  defaultFacilityId: any;
  caseStatus = CaseStatuses;

  constructor(private caseStore: AppStoreService, public modalController: ModalController, public alertController: AlertController,
    private translateService: TranslateService, private signalRCaseApiService: SignalRCaseApiService, private appStore: AppStoreService) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.setDefaultValues();
    this.establishSignalRConnection(this.defaultFacilityId);
  }

  ngOnDestroy(): void {
      this.signalRCaseApiService.stopConnection();
  }

  establishSignalRConnection(facilityId: string) {
    this.signalRCaseApiService.initializeSignalRCaseApiConnection();
    this.signalRCaseApiService.addCaseDataListener(facilityId);
  }

  deleteCase(selectedCase: Case) {
    const alertOptions: AlertOptions = {
      header: 'Confirm',
      message: 'Are you sure you want to delete the case?',
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.caseStore.deleteCase(selectedCase);
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  async presentAlert(options: AlertOptions) {
    const alert = await this.alertController.create(options);
    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  selectedFacilityChanged($event){
    this.selectedFacilityId = $event.target.value;
    this.caseStore.getCases(this.selectedFacilityId);
    this.signalRCaseApiService.stopConnection();
    this.establishSignalRConnection(this.selectedFacilityId);
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
