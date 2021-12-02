import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  genders: string[] = [
    'Female',
    'Male'
  ];

  containerTypes = ContainerType;
  containerSizes = ContainerSize;
  containerTypeKeys =  Object.keys(ContainerType).filter(x => (parseInt(x, 10) >= 0));
  containerSizeKeys = Object.keys(ContainerSize).filter(x => (parseInt(x, 10) >= 0));

  case: ICase = {
    caseId: '',
    name: '',
    weight: '',
    gender: '',
    containerType: '',
    containerSize: '',
    status: ''
  };

  case$: Observable<ICase>;
  constructor(private route: ActivatedRoute, private caseService: CaseService) { }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');
    if(id) {
      this.caseService.getCase(id).subscribe(result => {
        this.case = result;
        console.log(this.case);
      });
    }
  }

  onSubmit() {
    console.log(this.case);
  }

}
