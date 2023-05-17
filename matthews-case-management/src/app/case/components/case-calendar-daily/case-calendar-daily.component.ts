import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, take } from 'rxjs';
import { Case } from 'src/app/models/case.model';

@Component({
  selector: 'case-calendar-daily',
  templateUrl: './case-calendar-daily.component.html',
  styleUrls: ['./case-calendar-daily.component.scss']
})
export class CaseCalendarDailyComponent implements OnInit {
  @Input()
  cases!: Case[];

  @Input()
  days!: Date[];

  @Input()
  selectedDay!: Date;

  @Output() selectedDayChange = new EventEmitter<Date>();

  buttonUsed: number = 0;
  iconName: string = 'check_circle';
  statusDescription: string = 'cremation complete';

  constructor(private translate: TranslateService) {

  }

  ngOnInit(): void {
    this.checkHeaderDayButtons();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDay'] || changes['days']) {
      this.checkHeaderDayButtons();
    }
  }

  checkHeaderDayButtons() {
    let index = this.days.map(Number).indexOf(+this.selectedDay);
    this.buttonUsed = index;
  }

  getDayForButton(indexNumber: number): string {
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString('en-us', { month: 'short' })}`;
  }

  dayClick(dayClick: number) {
    this.changeSelectedDay(this.days[dayClick])
    this.buttonUsed = dayClick;
  }

  changeSelectedDay(value: Date) {
    this.selectedDayChange.emit(value);
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

}
