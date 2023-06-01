import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription, skip, tap } from 'rxjs';
import { Case } from 'src/app/models/case.model';
import { Device } from 'src/app/models/device.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { StateService } from 'src/app/services/states.service';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
  selector: 'case-calendar',
  templateUrl: './case-calendar.component.html',
  styleUrls: ['./case-calendar.component.scss']
})
export class CaseCalendarComponent implements OnInit, OnDestroy {

  daily: boolean = true;
  numberOfCases: number = 0;
  selectedDay: Date = new Date();
  hiddenDayForNavigation: Date = new Date(this.selectedDay);
  days: Date[] = [];
  weekNumber: number | undefined;
  startDayOfWeek: 0 | 1 = 1;
  devices: Device[] = [];

  private subs = new Subscription();

  @ViewChild('clickHoverMenuTrigger') clickHoverMenuTrigger?: MatMenuTrigger;

  constructor(
    private stateService: StateService,
    private calendarService: CalendarService,
    private userSettingService: UserSettingService) {

    this.subs.add(this.userSettingService.userSettings$
      .pipe(tap(setting => this.startDayOfWeek = setting.startDayOfWeek))
      .pipe(skip(1))
      .subscribe(setting => {
        this.startDayOfWeek = setting.startDayOfWeek;
      }));

    this.subs.add(this.userSettingService.userSettings$.subscribe(s => {
        this.getDays(this.hiddenDayForNavigation);
    }));

    this.subs.add(this.stateService.devicesToShowAsFilter$.pipe(skip(1)).subscribe(devices => {
      this.devices = devices;
      console.log('devices of site:', devices);
    }));

    this.subs.add(this.stateService.numberOfCasesToShowAsFilter$.pipe(skip(1)).subscribe(numberOfCases => this.numberOfCases = numberOfCases));
  }

  ngOnInit(): void {
    this.getDays(this.selectedDay);
    this.selectedDay.setHours(0, 0, 0, 0);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  switchCalendarView(viewDaily: boolean) {
    this.daily = viewDaily;
  }

  previousWeek() {
    this.hiddenDayForNavigation = this.calendarService.addDays(this.hiddenDayForNavigation, -7);
    this.getDays(this.hiddenDayForNavigation);

  }

  nextWeek() {
    this.hiddenDayForNavigation = this.calendarService.addDays(this.hiddenDayForNavigation, 7);
    this.getDays(this.hiddenDayForNavigation);
  }

  getDays(date: Date) {
    this.days = this.calendarService.getWeekForGivenDate(date, this.startDayOfWeek);
    this.weekNumber = this.calendarService.getWeekNumberByDate(date);
    this.stateService.setFirstDateInWeek(this.days[0]); // proclame the first date in week
  }

  getFirstWeekDate(): string {
    return this.calendarService.getDateAndMonth(this.days[0]);
  }

  getLastWeekDate(): string {
    return this.calendarService.getDateAndMonth(this.days[6]);
  }

  daySelectedEvent(date: Date) {
    if (date instanceof Date) {
      this.selectedDay = date;
      this.stateService.setSelectedDate(date);

      this.getDays(this.selectedDay);
      this.clickHoverMenuTrigger?.closeMenu();
    }
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;
}
