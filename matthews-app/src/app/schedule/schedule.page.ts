/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable @angular-eslint/component-selector */
import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { AppStoreService } from '../app.store.service';
import { AlertController, AlertOptions, ModalController } from '@ionic/angular';
import { Case } from '../case/case';
import { CaseStatuses } from '../core/enums';
import { TranslateService } from '@ngx-translate/core';
import { SignalRCaseApiService } from '../core/signal-r.case-api.service';
import { Facility } from '../facility/facility';
import { DatePipe } from '@angular/common';

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
  selectedFacility = new Facility();
  selectedButton: string = 'day';

  calendarView: 'byDay' | 'byWeek' | 'byUnscheduled' = 'byDay';
  selectedDay: Date = new Date();
  hiddenDayForNavigation: Date = new Date(this.selectedDay);

  scheduledCount: number = 0;
  completedCount: number = 0;

  constructor(private caseStore: AppStoreService, public modalController: ModalController, public alertController: AlertController,
    private translateService: TranslateService, private signalRCaseApiService: SignalRCaseApiService, private appStore: AppStoreService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.setDefaultValues();
    this.establishSignalRConnection(this.defaultFacilityId);
    this.selectFacility(this.selectedFacility, this.defaultFacilityId);
  }

  ngOnDestroy(): void {
      this.signalRCaseApiService.stopConnection();
  }

  establishSignalRConnection(facilityId: string) {
    this.signalRCaseApiService.initializeSignalRCaseApiConnection();
    this.signalRCaseApiService.addCaseDataListener(facilityId);
  }

  selectFacility(facility: Facility, id: string) {
    this.selectedFacility.name = facility.name;
    this.selectedFacility.id = id;
    this.appStore.updateSelectedFacility(this.selectedFacility);
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
    this.selectFacility($event.target, $event.target.value);
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
      this.defaultFacilityId = (result.selectedFacility !== null && typeof result.selectedFacility !== 'undefined' && Object.keys(result.selectedFacility).length !== 0) ? result.selectedFacility.id : result.facilities[0].id;
    });

    this.caseStore.getCases(this.defaultFacilityId);
  }


  checkScheduledStartTime(date: string): boolean {
    return !(date == '0001-01-01T00:00:00Z' || date == null);
  }

  displayScheduledStartTime(date: string) {
    if (date == '0001-01-01T00:00:00Z' || date == null) {
      return this.translateService.instant('scheduleDateMissing');
    }
    else {
      return this.translateService.instant('scheduleDate') + ': ' + this.datePipe.transform(date, 'short');
    }
  }

  selectButton(button: string) {
    this.selectedButton = button;
  }

  switchView(viewDaily: 'byDay' | 'byWeek' | 'byUnscheduled') {
    this.calendarView = viewDaily;
  }

  previousWeek() {
    if (this.calendarView == 'byDay') {
      let datePrevious: Date = new Date(this.selectedDay);
      datePrevious.setDate(this.selectedDay.getDate() - 1);
      this.daySelectedEvent(datePrevious);
    }
  }

  nextWeek() {
    if (this.calendarView == 'byDay') {
      let dateNext: Date = new Date(this.selectedDay);
      dateNext.setDate(this.selectedDay.getDate() + 1);
      this.daySelectedEvent(dateNext);
    }
  }

  daySelectedEvent(date: Date) {
    if (date instanceof Date) {

      //let time = this.calendarService.getDateInUserProfilesTimezone(date);

      date.setHours(12, 0, 0, 0);
      this.selectedDay = date;
      this.hiddenDayForNavigation = date;
      //this.getDays(this.selectedDay);
    }
  }

  filterCases(cases: Case[]): Case[] {
    this.scheduledCount = 0;  // Reset counts before filtering
    this.completedCount = 0;

    const filteredCases = cases.filter(caseItem => this.isSameDay(new Date(caseItem.scheduledStartTime), this.selectedDay));

    return filteredCases;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  updateCounts(cases: Case[]) {
    const filteredCases = this.filterCases(cases);
    this.scheduledCount = filteredCases.length;
    this.completedCount = filteredCases.filter(caseItem => caseItem.status === 1).length;
  }
}
