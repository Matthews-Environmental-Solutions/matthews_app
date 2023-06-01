import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Case } from 'src/app/models/case.model';
import { CaseService } from 'src/app/services/cases.service';
import { StateService } from 'src/app/services/states.service';

@Component({
  selector: 'case-calendar-weekly',
  templateUrl: './case-calendar-weekly.component.html',
  styleUrls: ['./case-calendar-weekly.component.scss']
})
export class CaseCalendarWeeklyComponent implements OnInit {

  @Input()
  days!: Date[];

  cases: Case[] = [];
  selectedFacilityId!: string;
  firstDateInWeek!: Date;
  loader: boolean = false;

  casesForDay1: Case[] = [];
  casesForDay2: Case[] = [];
  casesForDay3: Case[] = [];
  casesForDay4: Case[] = [];
  casesForDay5: Case[] = [];
  casesForDay6: Case[] = [];
  casesForDay7: Case[] = [];

  private subs = new Subscription();

  constructor(private caseService: CaseService, private stateService: StateService) {
  }

  ngOnInit(): void {
    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.selectedFacilityId = f;
    }));

    this.subs.add(this.stateService.firstDateInWeek$.subscribe(d => {
      this.firstDateInWeek = d;
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));

    this.subs.add(this.stateService.devicesFromSite$.subscribe(devices => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCasesByWeek(): void {
    this.loader = true;
    this.casesForDay1 = [];
    this.casesForDay2 = [];
    this.casesForDay3 = [];
    this.casesForDay4 = [];
    this.casesForDay5 = [];
    this.casesForDay6 = [];
    this.casesForDay7 = [];

    this.caseService.getScheduledCasesByWeek(this.selectedFacilityId, this.firstDateInWeek).subscribe((response: any) => {
      console.log(response);
      this.cases = response;
      this.parseCasesByDays();
      this.stateService.parseCasesByDevices(this.cases);
      this.loader = false;
    });
  }

  parseCasesByDays(): void {
    this.cases.forEach(c => {
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[0])) {
        this.casesForDay1.push(c);
      }
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[1])) {
        this.casesForDay2.push(c);
      }
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[2])) {
        this.casesForDay3.push(c);
      }
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[3])) {
        this.casesForDay4.push(c);
      }
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[4])) {
        this.casesForDay5.push(c);
      }
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[5])) {
        this.casesForDay6.push(c);
      }
      if (this.formatStringDate(c.scheduledStartTime) == this.formatDate(this.days[6])) {
        this.casesForDay7.push(c);
      }
    })
  }

  getDayForButton(indexNumber: number): string {
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString('en-us', { month: 'short' })}`;
  }

  formatStringDate(dateString: string): string {
    let date = new Date(dateString);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 00:00:00";
  }

  getIconName(status: number): string {
    switch (status) {
      case 1:
        return 'check_circle';
      case 2:
        return 'local_fire_department';
      case 3:
        return 'arrow_circle_right';
      case 4:
        return 'hourglass_top';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 00:00:00";
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;
}
