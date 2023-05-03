import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
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

  changeSelectedDay(value: Date) {
    this.selectedDayChange.emit(value);
  }

  ngOnInit(): void {
    this.checkHeaderDayButtons();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDay'] || changes['days']) {
      this.checkHeaderDayButtons();
    }
  }

  buttonUsed: number = 0;
  iconName: string = 'check_circle';
  statusDescription: string = 'cremation complete';

  getDayForButton(indexNumber: number): string {
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString('en-us', { month: 'short' })}`;
  }

  dayClick(dayClick: number) {
    this.changeSelectedDay(this.days[dayClick])
    this.buttonUsed = dayClick;
  }

  checkHeaderDayButtons() {
    let index = this.days.map(Number).indexOf(+this.selectedDay);
    this.buttonUsed = index;
  }


}
