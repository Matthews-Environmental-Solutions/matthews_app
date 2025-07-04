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
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

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

  weeklyScheduledCount: number = 0;
  weeklyCompletedCount: number = 0;

  days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  cases: Case[] = [];


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

  establishSignalRConnection(facilityId: string, previousFacilityId?: string) {
    this.signalRCaseApiService.initializeSignalRCaseApiConnection();
    this.signalRCaseApiService.setSelectedFacilityFromSchedulePage(facilityId, previousFacilityId);
    this.signalRCaseApiService.addCaseDataListener(facilityId);
  }

  selectFacility(facility: Facility, id: string) {
    this.selectedFacility.name = facility.name;
    this.selectedFacility.id = id;
    this.appStore.setSelectedFacility(this.selectedFacility);
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

  selectedFacilityChanged($event) {
    const previousFacilityId = this.selectedFacilityId;
    this.selectedFacilityId = $event.target.value;
    if(this.calendarView == 'byDay') this.caseStore.getCasesByDay([this.selectedFacilityId, this.selectedDay]);
    if(this.calendarView == 'byWeek') this.caseStore.getCasesByWeek([this.selectedFacilityId, this.getFirstDayOfTheWeekAsDate()]);
    if(this.calendarView == 'byUnscheduled') this.caseStore.getUnscheduledCases([this.appStore.getSelectedFacility()]);
    this.signalRCaseApiService.stopConnection();
    this.selectFacility($event.target, $event.target.value);
    this.establishSignalRConnection(this.selectedFacilityId, previousFacilityId);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  presentModal(selectedCase?: Case) {
    this.caseStore.openCaseModal(selectedCase ?
      { ...selectedCase, scheduledFacility: this.selectedFacilityId ?? this.defaultFacilityId } :
      { scheduledFacility: this.selectedFacilityId ?? this.defaultFacilityId } as Case);
  }

  setDefaultValues() {
    this.caseStore.scheduleVm$.subscribe(result => {
      const facility = result.selectedFacility &&
        Object.keys(result.selectedFacility).length !== 0
        ? result.selectedFacility
        : (result.facilities?.length ? result.facilities[0] : null);
  
      if (!facility || !facility.id) {
        console.warn('No valid facility found in scheduleVm$', result);
        return;
      }
  
      this.defaultFacilityId = facility.id;
      this.selectedFacilityId = facility.id;
    });
  
    this.caseStore.refreshCasesList$
      .pipe(withLatestFrom(this.caseStore.scheduleVm$))
      .subscribe(([_, result]) => {
        const facility = result.selectedFacility &&
          Object.keys(result.selectedFacility).length !== 0
          ? result.selectedFacility
          : (result.facilities?.length ? result.facilities[0] : null);
  
        if (!facility || !facility.id) {
          console.warn('No valid facility found in refreshCasesList$', result);
          return;
        }
  
        const facilityId = facility.id;
  
        if (this.calendarView === 'byDay') {
          this.caseStore.getCasesByDay([facilityId, this.selectedDay]);
        } else if (this.calendarView === 'byWeek') {
          this.caseStore.getCasesByWeek([facilityId, this.getFirstDayOfTheWeekAsDate()]);
        } else if (this.calendarView === 'byUnscheduled') {
          this.caseStore.getUnscheduledCases([facility]);
        }
      });
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
    if (viewDaily == 'byDay' && this.selectedFacilityId != undefined) {
      this.caseStore.getCasesByDay([this.selectedFacilityId, this.selectedDay]);
    }
    if (viewDaily == 'byWeek' && this.selectedFacilityId != undefined) {
      this.caseStore.getCasesByWeek([this.selectedFacilityId, this.getFirstDayOfTheWeekAsDate()]);
      // this.caseStore.weeklyCaseCount$.subscribe(count => {
      //   this.weeklyScheduledCount = count;
      // });
    }
    if (viewDaily == 'byUnscheduled') {
      this.caseStore.getUnscheduledCases([this.appStore.getSelectedFacility()]);
    }
  }


  previousWeek() {
    if (this.calendarView == 'byDay') {
      let datePrevious: Date = new Date(this.selectedDay);
      datePrevious.setDate(this.selectedDay.getDate() - 1);
      this.daySelectedEvent(datePrevious);
    }
    if (this.calendarView == 'byWeek') {
      let datePrevious: Date = new Date(this.selectedDay);
      datePrevious.setDate(this.selectedDay.getDate() - 7);
      this.daySelectedEvent(datePrevious);
    }
  }

  nextWeek() {
    if (this.calendarView == 'byDay') {
      let dateNext: Date = new Date(this.selectedDay);
      dateNext.setDate(this.selectedDay.getDate() + 1);
      this.daySelectedEvent(dateNext);
    }
    if (this.calendarView == 'byWeek') {
      let dateNext: Date = new Date(this.selectedDay);
      dateNext.setDate(this.selectedDay.getDate() + 7);
      this.daySelectedEvent(dateNext);
    }
  }

  daySelectedEvent(date: Date) {
    if (date instanceof Date) {

      date.setHours(12, 0, 0, 0);
      this.selectedDay = date;
      this.hiddenDayForNavigation = date;
      if (this.calendarView == 'byDay' && this.selectedFacilityId != undefined) this.caseStore.getCasesByDay([this.selectedFacilityId, date]);
      if (this.calendarView == 'byWeek' && this.selectedFacilityId != undefined) this.caseStore.getCasesByWeek([this.selectedFacilityId, this.getFirstDayOfTheWeekAsDate()]);
      //this.getDays(this.selectedDay);
    }
  }

  filterCases(cases: Case[]): Case[] {
    this.scheduledCount = 0;  // Reset counts before filtering
    this.completedCount = 0;

    const filteredCases = cases.filter(caseItem => this.isSameDay(new Date(caseItem.scheduledStartTime), this.selectedDay));

    return filteredCases;
  }

  switchToDay(date: string) {
    const day = new Date(date);
    this.selectedDay = day;
    this.switchView('byDay');
    this.selectedButton = 'day';
  }


  getFirstDayOfTheWeek(): string {
    const dayOfWeek = this.selectedDay.getDay(); // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
    const firstDayOfWeek = new Date(this.selectedDay); // Clone the selected day
    firstDayOfWeek.setDate(this.selectedDay.getDate() - dayOfWeek); // Subtract days to get Sunday (or Monday)
    return this.datePipe.transform(firstDayOfWeek, 'd'); // Return formatted date
  }

  getFirstDayOfTheWeekAsDate(): Date {
    const dayOfWeek = this.selectedDay.getDay(); // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
    const firstDayOfWeek = new Date(this.selectedDay); // Clone the selected day
    firstDayOfWeek.setDate(this.selectedDay.getDate() - dayOfWeek); // Subtract days to get Sunday (or Monday)
    return firstDayOfWeek;
  }


  getLastDayOfTheWeek(): string {
    const dayOfWeek = this.selectedDay.getDay(); // Get the day of the week
    const lastDayOfWeek = new Date(this.selectedDay); // Clone the selected day
    lastDayOfWeek.setDate(this.selectedDay.getDate() + (6 - dayOfWeek)); // Add days to get Saturday (or Sunday)
    return this.datePipe.transform(lastDayOfWeek, 'd'); // Return formatted date
  }

  getLastDayOfTheWeekAsDate(): Date {
    const dayOfWeek = this.selectedDay.getDay(); // Get the day of the week
    const lastDayOfWeek = new Date(this.selectedDay); // Clone the selected day
    lastDayOfWeek.setDate(this.selectedDay.getDate() + (6 - dayOfWeek)); // Add days to get Saturday (or Sunday)
    return lastDayOfWeek; // Return formatted date
  }

  getWeeklyDay(index: number): string {
    const dayOfWeek = this.selectedDay.getDay();
    const day = new Date(this.selectedDay);
    day.setDate(this.selectedDay.getDate() - dayOfWeek + index);
    return this.datePipe.transform(day, 'MMM d, yyyy');
  }

  filterCasesForDay(cases: Case[], index: number) {
    const dayOfWeek = this.selectedDay.getDay();
    const day = new Date(this.selectedDay);
    day.setDate(this.selectedDay.getDate() - dayOfWeek + index);
    const filteredCases = cases.filter(caseItem => this.isSameDay(new Date(caseItem.scheduledStartTime), day));
    return filteredCases;
  }

  getScheduledForDay(cases: Case[], index: number) {
    const filteredCases = this.filterCasesForDay(cases, index);
    return filteredCases.length;
  }

  getCompletedForDay(cases: Case[], index: number) {
    const filteredCases = this.filterCasesForDay(cases, index);
    return filteredCases.filter(caseItem => caseItem.status === 5).length;
  }

  getInProgressForDay(cases: Case[], index: number) {
    const filteredCases = this.filterCasesForDay(cases, index);
    return filteredCases.filter(caseItem => caseItem.status === 2).length;
  }

  getMonthFromDate(date: Date) {
    let currntMonth: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
    return currntMonth[date.getMonth()];
  }

  getYearFromDate() {
    return this.selectedDay.getFullYear();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  isToday(index: number): boolean {
    const today = new Date();
    const dayOfWeek = this.selectedDay.getDay();
    const day = new Date(this.selectedDay);
    day.setDate(this.selectedDay.getDate() - dayOfWeek + index);

    // Reset hours, minutes, seconds, and milliseconds for an accurate comparison
    today.setHours(0, 0, 0, 0);
    day.setHours(0, 0, 0, 0);

    return day.getTime() === today.getTime();
  }


  updateCounts(cases: Case[]) {
    const filteredCases = this.filterCases(cases);
    this.scheduledCount = filteredCases.length;
    this.completedCount = filteredCases.filter(caseItem => caseItem.status === 1).length;
    this.weeklyScheduledCount = cases.length;
    this.weeklyCompletedCount = cases.filter(caseItem => caseItem.status == 5).length;
  }

}
