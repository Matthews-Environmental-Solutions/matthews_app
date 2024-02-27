import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription, skip, tap } from 'rxjs';
import { Device } from 'src/app/models/device.model';
import { UserSettingData } from 'src/app/models/user-setting.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { StateService } from 'src/app/services/states.service';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
  selector: 'case-calendar',
  templateUrl: './case-calendar.component.html',
  styleUrls: ['./case-calendar.component.scss']
})
export class CaseCalendarComponent implements OnInit, OnDestroy {

  calendarView: 'byDay' | 'byWeek' = 'byDay';
  numberOfCases: number = 0;
  selectedDay: Date = new Date();
  hiddenDayForNavigation: Date = new Date(this.selectedDay);
  days: Date[] = [];
  weekNumber: number | undefined;
  startDayOfWeek: 0 | 1 = 1;
  devices: Device[] = [];
  clickedDeviceFilterButton: string = 'all';

  private subs = new Subscription();

  @ViewChild('clickHoverMenuTrigger') clickHoverMenuTrigger?: MatMenuTrigger;

  constructor(
    private stateService: StateService,
    private calendarService: CalendarService,
    private userSettingService: UserSettingService) {

      // this.selectedDay = calendarService.setDayInTimeZone();

    this.subs.add(this.userSettingService.userSettings$
      .pipe(tap(setting => this.startDayOfWeek = setting.startDayOfWeek))
      .pipe(skip(1))
      .subscribe(setting => {
        this.startDayOfWeek = setting.startDayOfWeek;
        this.calendarView = setting.lastUsedCalendarView;
        this.selectedDay = setting.lastUsedSelectedDay;
      }));

    this.subs.add(this.userSettingService.userSettings$.subscribe(s => {
      this.getDays(this.hiddenDayForNavigation);
    }));

    this.subs.add(this.stateService.devicesToShowAsFilter$.pipe(skip(1)).subscribe(devices => {
      this.devices = devices;
    }));

    this.subs.add(this.stateService.numberOfCasesToShowAsFilter$.pipe(skip(1)).subscribe(numberOfCases => this.numberOfCases = numberOfCases));
  }

  ngOnInit(): void {
    this.hiddenDayForNavigation = new Date(this.userSettingService.getUserSettingLastValue().lastUsedSelectedDay);
    this.selectedDay = this.hiddenDayForNavigation;
    this.getDays(this.selectedDay);
    // this.selectedDay.setHours(12, 0, 0, 0);
    this.calendarView = this.userSettingService.getUserSettingLastValue().lastUsedCalendarView;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  todayClick() {
    var todayClick = new Date();
    todayClick.setHours(12, 0, 0, 0);

    this.stateService.setSelectedDate(todayClick);

    let userSetting = this.userSettingService.getUserSettingLastValue();
    userSetting.lastUsedSelectedDay = todayClick;
    localStorage.setItem(userSetting.username, JSON.stringify(userSetting));
    this.userSettingService.setUserSetting(userSetting);
  }

  switchCalendarView(viewDaily: 'byDay' | 'byWeek') {
    this.calendarView = viewDaily;
    let userSetting = this.userSettingService.getUserSettingLastValue();
    userSetting.lastUsedCalendarView = viewDaily;

    this.setUserSettingToLocalStore(userSetting.username, userSetting);
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

      let time = this.calendarService.getDateInUserProfilesTimezone(date);
      console.log("time: ", time);

      date.setHours(12, 0, 0, 0);
      this.selectedDay = date;
      this.hiddenDayForNavigation = date;
      this.stateService.setSelectedDate(date);
      let userSetting = this.userSettingService.getUserSettingLastValue();
      userSetting.lastUsedSelectedDay = date;

      this.setUserSettingToLocalStore(userSetting.username, userSetting);

      this.getDays(this.selectedDay);
      this.clickHoverMenuTrigger?.closeMenu();
    }
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;

  onDeviceFilterClick(deviceIdFilter: string) {
    this.clickedDeviceFilterButton = deviceIdFilter;
    this.stateService.setFilterCasesByDeviceId(deviceIdFilter);
  }

  wasIClicked(buttonId: string): 'primary' | 'accent' {
    return this.clickedDeviceFilterButton == buttonId ? 'accent' : 'primary';
  }

  setUserSettingToLocalStore(username: string, userSetting: UserSettingData) {
    localStorage.setItem(username, JSON.stringify(userSetting));
    this.userSettingService.setUserSetting(userSetting);
  }
}
