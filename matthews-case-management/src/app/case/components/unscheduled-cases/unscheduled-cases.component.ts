import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Case } from 'src/app/models/case.model';

@Component({
  selector: 'unscheduled-cases',
  templateUrl: './unscheduled-cases.component.html',
  styleUrls: ['./unscheduled-cases.component.scss']
})
export class UnscheduledCasesComponent {
  @Input()
  case!: Case;

  constructor(private router: Router) {

  }

  gotoCaseEdit() {
    this.router.navigate([`case/${this.case.id}`]);
  }
}
