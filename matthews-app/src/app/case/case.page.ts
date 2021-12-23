import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ICase } from './case';
import { CaseService } from './case.service';

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

  case: ICase = {
    id: 0,
    caseId: '',
    caseName: '',
    weight: '',
    gender: '',
    containerType: '',
    containerSize: '',
    status: ''
  };

  case$: Observable<ICase>;
  constructor(private route: ActivatedRoute, private router: Router, private caseService: CaseService) { }

  ngOnInit() {

    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.getSelectedCase();
  }

  getSelectedCase() {
    if(this.id) {
      this.caseService.getCase(this.id).subscribe(result => {
        this.case = result;
      });
    }
  }

  onSubmit() {
    if(!this.id) {
      this.createCase();
    } else {
      this.updateCase();
    }
    this.router.navigate(['/schedule']);
  }

  createCase() {
    this.caseService.createCase(this.case).subscribe();
  }

  updateCase() {
    this.caseService.updateCase(this.id, this.case).subscribe();
  }

}
