import { Component, Input } from '@angular/core';
import { Case } from 'src/app/models/case.model';

@Component({
  selector: 'case-calendar-weekly',
  templateUrl: './case-calendar-weekly.component.html',
  styleUrls: ['./case-calendar-weekly.component.scss']
})
export class CaseCalendarWeeklyComponent {
  @Input()
  cases!: Case[];

  @Input()
  days!: Date[];

  getDayForButton(indexNumber: number): string {
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString('en-us', { month: 'short' })}`;
  }
}
