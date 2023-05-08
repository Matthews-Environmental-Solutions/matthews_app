import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatMenuTrigger } from '@angular/material/menu';
import { Case } from 'src/app/models/case.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { CaseService } from 'src/app/services/cases.service';

@Component({
  selector: 'case-calendar',
  templateUrl: './case-calendar.component.html',
  styleUrls: ['./case-calendar.component.scss']
})
export class CaseCalendarComponent implements OnInit {
  daily: boolean = true;
  cases: Case[] = [];
  selectedDay: Date = new Date();
  hiddenDayForNavigation: Date = new Date(this.selectedDay);
  days: Date[] = [];
  weekNumber: number | undefined;

  @ViewChild('clickHoverMenuTrigger') clickHoverMenuTrigger?: MatMenuTrigger;

  constructor(private caseService: CaseService, private calendarService: CalendarService) {
  }

  ngOnInit(): void {
    this.getDaysAndCases();
  }

  getDaysAndCases() {
    this.getDays(this.selectedDay);
    
    this.caseService.getCases(this.days).subscribe((response: any) => {
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
    this.days = this.calendarService.getWeekForGivenDate(date, 0); // <---------------------Ovde proslediti pocetni dan u nedelji
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
