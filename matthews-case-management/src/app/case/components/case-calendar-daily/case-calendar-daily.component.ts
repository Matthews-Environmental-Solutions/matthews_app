import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, of, take } from 'rxjs';
import { Case } from 'src/app/models/case.model';
import { CaseService } from 'src/app/services/cases.service';
import { StateService } from 'src/app/services/states.service';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
  selector: 'case-calendar-daily',
  templateUrl: './case-calendar-daily.component.html',
  styleUrls: ['./case-calendar-daily.component.scss']
})
export class CaseCalendarDailyComponent implements OnInit {

  @Input()
  days!: Date[];

  @Output() selectedDayChange = new EventEmitter<Date>();

  cases: Case[] = [];
  selectedDay!: Date;
  selectedFacilityId!: string;

  buttonUsed: number = 0;
  iconName: string = 'check_circle';
  statusDescription: string = 'cremation complete';
  loader: boolean = false;

  private subs = new Subscription();

  constructor(private translate: TranslateService, private caseService: CaseService, private stateService: StateService, private userSettingService: UserSettingService,
    private router: Router) {
  }

  ngOnInit(): void {

    this.subs.add(this.userSettingService.userSettings$.subscribe(s => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.selectedFacilityId = f;
      if (!this.isEmptyString(f) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    this.subs.add(this.stateService.selectedDate$.subscribe(d => {
      d.setHours(0, 0, 0, 0);
      this.selectedDay = d;
      this.checkHeaderDayButtons();

      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDay'] || changes['days']) {
      this.checkHeaderDayButtons();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCasesByDate() {
    this.loader = true;
    this.caseService.getScheduledCasesByDay(this.selectedFacilityId, this.selectedDay).subscribe((response: any) => {
      this.cases = response;
      this.loader = false;
    });
  }

  checkHeaderDayButtons() {
    let index = this.days.map(Number).indexOf(+this.selectedDay);
    this.buttonUsed = index;
  }

  getDayForButton(indexNumber: number): string {
    let currentLang = this.translate.store.currentLang;
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString(currentLang, { month: 'short' })}`;
  }

  dayClick(dayClick: number) {
    this.stateService.setSelectedDate(this.days[dayClick]);
    this.changeSelectedDay(this.days[dayClick]);
    this.buttonUsed = dayClick;
  }

  changeSelectedDay(value: Date) {
    this.selectedDayChange.emit(value);
  }

  gotoCaseEdit(caseId: string) {
    this.router.navigate([`case/${caseId}`]);
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

  getStatusDescription(status: number): Observable<string> {
    switch (status) {
      case 1:
        return this.translate.get('cremationComplete').pipe(take(1));
      case 2:
        return this.translate.get('inProgress').pipe(take(1));
      case 3:
        return this.translate.get('readyToCremate').pipe(take(1));
      case 4:
        return this.translate.get('waitingForPermit').pipe(take(1));
      default:
        return of('');
    }
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;
}
