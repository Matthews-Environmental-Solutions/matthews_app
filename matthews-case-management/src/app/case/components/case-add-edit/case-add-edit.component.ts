import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { CaseStatus } from 'src/app/models/case-status.model';
import { Case } from 'src/app/models/case.model';
import { ContainerType } from 'src/app/models/container-type.model';
import { Cremator } from 'src/app/models/cremator.model';
import { LoadSize } from 'src/app/models/load-size.model';
import { MtxCalendarView, MtxDatetimepickerMode, MtxDatetimepickerType } from '@ng-matero/extensions/datetimepicker';

@Component({
  selector: 'case-add-edit',
  templateUrl: './case-add-edit.component.html',
  styleUrls: ['./case-add-edit.component.scss'],
})
export class CaseAddEditComponent implements OnInit {
  @Input() case?: Case;
  @ViewChild('clickDateHoverMenuTrigger') clickDateHoverMenuTrigger?: MatMenuTrigger;
  @ViewChild('clickTimeHoverMenuTrigger') clickTimeHoverMenuTrigger?: MatMenuTrigger;

  title: string = 'addNewCase';

  containerTypes: ContainerType[] = [];
  loadSizes: LoadSize[] = [];
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

  constructor(private route: ActivatedRoute, private fb: FormBuilder) { 
    this.caseForm = new FormGroup({
      clientCaseId: new FormControl('', { nonNullable: true }),
      firstName: new FormControl('', { nonNullable: true }),
      lastName: new FormControl('', { nonNullable: true }),
      weight: new FormControl('', { nonNullable: true }),
      gender: new FormControl('', { nonNullable: true }),
      age: new FormControl('', { nonNullable: true }),
      containerType: new FormControl('', { nonNullable: true }),
      loadSize: new FormControl('', { nonNullable: true }),
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
  }

  save() {
    console.log('SAVE', this.caseForm.value);
  }

  getScheduledStartDateTime(): Date {
    return this.caseForm.get('scheduledStartDateTime')?.value as Date;
  }

}
