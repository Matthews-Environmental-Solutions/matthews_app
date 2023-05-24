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

  private subs = new Subscription();

  constructor(private caseService: CaseService, private stateService: StateService) {
  }

  ngOnInit(): void {
    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.selectedFacilityId = f;
      if (!this.isEmptyString(f) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));

    this.subs.add(this.stateService.firstDateInWeek$.subscribe(d => {
      this.firstDateInWeek = d;
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCasesByWeek(): void {
    this.caseService.getScheduledCasesByWeek(this.selectedFacilityId, this.firstDateInWeek).subscribe((response: any) => {
      console.log(response);
      this.cases = response;
    });
  }

  getDayForButton(indexNumber: number): string {
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString('en-us', { month: 'short' })}`;
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;
}
