import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription, skip, tap } from 'rxjs';
import { Case } from 'src/app/models/case.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { CaseService } from 'src/app/services/cases.service';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
  selector: 'case-calendar',
  templateUrl: './case-calendar.component.html',
  styleUrls: ['./case-calendar.component.scss']
})
export class CaseCalendarComponent implements OnInit, OnDestroy {
  daily: boolean = true;
  cases: Case[] = [];
  selectedDay: Date = new Date();
  hiddenDayForNavigation: Date = new Date(this.selectedDay);
  days: Date[] = [];
  weekNumber: number | undefined;
  startDayOfWeek: 0 | 1 = 1;

  private subs = new Subscription();

  @ViewChild('clickHoverMenuTrigger') clickHoverMenuTrigger?: MatMenuTrigger;

  constructor(private caseService: CaseService, private calendarService: CalendarService, private userSettingService: UserSettingService) {
    this.subs.add(this.userSettingService.userSettings$
      .pipe(tap(setting => this.startDayOfWeek = setting.startDayOfWeek))
      .pipe(skip(1)).subscribe(setting => {
        this.startDayOfWeek = setting.startDayOfWeek;
        this.getDaysAndCases();
      }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.getDaysAndCases();
  }

  getDaysAndCases() {
    this.getDays(this.selectedDay);

    this.caseService.getCases2(this.days).subscribe((response: any) => {
      console.log(response);
      this.cases = response;
    });
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
      this.getDays(this.selectedDay);
      this.clickHoverMenuTrigger?.closeMenu();
    }
  }
}
