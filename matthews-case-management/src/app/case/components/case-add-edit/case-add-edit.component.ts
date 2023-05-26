import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { CaseStatus } from 'src/app/models/case-status.model';
import { Case } from 'src/app/models/case.model';
import { ContainerType } from 'src/app/models/container-type.model';
import { Cremator } from 'src/app/models/cremator.model';
import { ContainerSize } from 'src/app/models/load-size.model';
import { MtxCalendarView, MtxDatetimepickerMode, MtxDatetimepickerType } from '@ng-matero/extensions/datetimepicker';
import { CaseService } from 'src/app/services/cases.service';

@Component({
  selector: 'case-add-edit',
  templateUrl: './case-add-edit.component.html',
  styleUrls: ['./case-add-edit.component.scss'],
})
export class CaseAddEditComponent implements OnInit {
  @Input() case?: Case;
  @ViewChild('clickDateHoverMenuTrigger') clickDateHoverMenuTrigger?: MatMenuTrigger;
  @ViewChild('clickTimeHoverMenuTrigger') clickTimeHoverMenuTrigger?: MatMenuTrigger;

  // (Infant/Standard/Bariatric

  title: string = 'addNewCase';

  containerTypes: ContainerType[] = [{id: 0, name: 'None'}, {id: 1, name: 'Cardboard'}, {id: 2, name: 'Hardwood'}, {id: 3, name: 'MDF Particle board'}, {id: 4, name: 'Bag/Shroud'}, {id: 4, name: 'Other'}];
  containerSizes: ContainerSize[] = [{id: 0, name: 'None'}, {id: 1, name: 'Infant'}, {id: 2, name: 'Standard'}, {id: 3, name: 'Bariatric'}];
  caseStatuses: CaseStatus[] = [];
  cremators: Cremator[] = [];
 
  caseForm: FormGroup;

  type: MtxDatetimepickerType = 'datetime';
  mode: MtxDatetimepickerMode = 'auto';
  startView: MtxCalendarView = 'month';
  multiYearSelector = false;
  touchUi = false;
  twelvehour = false;
  timeInterval = 1;
  timeInput = true;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private caseService: CaseService) { 
    this.caseForm = new FormGroup({
      clientCaseId: new FormControl('', { nonNullable: true }),
      firstName: new FormControl('', { nonNullable: true }),
      lastName: new FormControl('', { nonNullable: true }),
      weight: new FormControl('', { nonNullable: true }),
      gender: new FormControl('', { nonNullable: true }),
      age: new FormControl('', { nonNullable: true }),
      containerType: new FormControl('', { nonNullable: true }),
      containerSize: new FormControl('', { nonNullable: true }),
      status: new FormControl('', { nonNullable: true }),
      scheduledCremator: new FormControl('', { nonNullable: true }),
      burnMode: new FormControl('', { nonNullable: true }),
      scheduledStartDateTime: new FormControl(new Date(), { nonNullable: true })
    });
  }

  ngOnInit(): void {
    const caseId = this.route.snapshot.paramMap.get('id');
    // debugger;
    this.title = caseId == null ? 'addNewCase' : 'editCase';

    if(caseId){
      this.caseService.getCaseById(caseId)
      
      .subscribe(response => {
        this.case = response;
        this.caseForm.get('clientCaseId')?.setValue(response.clientCaseId);
        this.caseForm.get('firstName')?.setValue(response.firstName);
        this.caseForm.get('lastName')?.setValue(response.lastName);
        this.caseForm.get('weight')?.setValue(response.weight);
        this.caseForm.get('gender')?.setValue(response.gender.toString());
        this.caseForm.get('age')?.setValue(response.age);


        this.caseForm.get('containerType')?.setValue(response.containerType);
        this.caseForm.get('containerSize')?.setValue(response.containerSize);

        if(response.scheduledStartTime !== '0001-01-01T00:00:00'){
          this.caseForm.get('scheduledStartDateTime')?.setValue(new Date(response.scheduledStartTime));
        }
        
        
      });
    }
  }

  save() {
    console.log('SAVE', this.caseForm.value);
  }

  getScheduledStartDateTime(): Date {
    return this.caseForm.get('scheduledStartDateTime')?.value as Date;
  }

}
