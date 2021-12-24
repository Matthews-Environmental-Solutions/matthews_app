import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Case } from './case';
import { CaseStoreService } from './case.store.service';

export enum ContainerType {
  cardboard,
  fiberboard,
  hardwood,
  none,
}

export enum ContainerSize {
  child,
  standard,
  bariatric
}

@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {

  id = 0;

  genders: string[] = [
    'Female',
    'Male'
  ];

  containerTypes = ContainerType;
  containerSizes = ContainerSize;
  containerTypeKeys =  Object.keys(ContainerType).filter(x => (parseInt(x, 10) >= 0));
  containerSizeKeys = Object.keys(ContainerSize).filter(x => (parseInt(x, 10) >= 0));

  case$: Observable<Case>;

  constructor(private route: ActivatedRoute, private router: Router, private caseStore: CaseStoreService) { }

  ngOnInit() {

    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.caseStore.updateCaseId(this.id);
    this.case$ = this.caseStore.selectedCase$;
  }

  onSubmit(selectedCase: Case) {
    if(!this.id) {
      this.caseStore.createCase(selectedCase);
    } else {
      this.caseStore.updateCase(selectedCase);
    }
    this.router.navigate(['/schedule']);
  }

}
