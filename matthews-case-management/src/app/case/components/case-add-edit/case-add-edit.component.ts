import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { CaseStatus } from 'src/app/models/case-status.model';
import { Case } from 'src/app/models/case.model';
import { ContainerType } from 'src/app/models/container-type.model';
import { Cremator } from 'src/app/models/cremator.model';
import { ContainerSize } from 'src/app/models/load-size.model';
import { MtxCalendarView, MtxDatetimepickerMode, MtxDatetimepickerType } from '@ng-matero/extensions/datetimepicker';
import { CaseService } from 'src/app/services/cases.service';
import { Subscription } from 'rxjs';
import { StateService } from 'src/app/services/states.service';
import { Device } from 'src/app/models/device.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'case-add-edit',
  templateUrl: './case-add-edit.component.html',
  styleUrls: ['./case-add-edit.component.scss'],
})
export class CaseAddEditComponent implements OnInit {
  @Input() case?: Case;
  @ViewChild('clickDateHoverMenuTrigger') clickDateHoverMenuTrigger?: MatMenuTrigger;
  @ViewChild('clickTimeHoverMenuTrigger') clickTimeHoverMenuTrigger?: MatMenuTrigger;

  private WAITING_FOR_PERMIT: number = 4;

  title: string = 'addNewCase';

  containerTypes: ContainerType[] = [{ id: 0, name: 'None' }, { id: 1, name: 'Cardboard' }, { id: 2, name: 'Hardwood' }, { id: 3, name: 'MDF Particle board' }, { id: 4, name: 'Bag/Shroud' }, { id: 4, name: 'Other' }];
  containerSizes: ContainerSize[] = [{ id: 0, name: 'None' }, { id: 1, name: 'Infant' }, { id: 2, name: 'Standard' }, { id: 3, name: 'Bariatric' }];
  caseStatuses: CaseStatus[] = [];
  cremators: Device[] = [];
  selectedFacilityId!: string;

  caseForm: FormGroup;

  type: MtxDatetimepickerType = 'datetime';
  mode: MtxDatetimepickerMode = 'auto';
  startView: MtxCalendarView = 'month';
  multiYearSelector = false;
  touchUi = false;
  twelvehour = false;
  timeInterval = 1;
  timeInput = true;

  private subs = new Subscription();

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private caseService: CaseService, private stateService: StateService, private router: Router, private authService: AuthService) {
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

    this.subs.add(this.stateService.devicesFromSite$.subscribe(devices => this.cremators = devices));

    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.selectedFacilityId = f;
    }));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      let id = param.get('id');
      this.title = id == null ? 'addNewCase' : 'editCase';
      if (id) {
        this.getCaseFromApi(id);
      }
    });
    // debugger;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCaseFromApi(caseId: string): void {
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
        this.caseForm.get('scheduledCremator')?.setValue(response.scheduledDevice);

        if (response.scheduledStartTime !== '0001-01-01T00:00:00') {
          this.caseForm.get('scheduledStartDateTime')?.setValue(new Date(response.scheduledStartTime));
        }
      });
  }

  save() {
    console.log('SAVE', this.caseForm.value);

    if (!this.case) {
      this.case = new Case();
      this.case.id = '00000000-0000-0000-0000-000000000000';
      this.case.createdBy = this.authService.loggedInUser.sub;
      this.case.createdTime = this.formatDate(new Date());
    }

    this.case.clientCaseId = this.caseForm.get('clientCaseId')?.value;
    this.case.firstName = this.caseForm.get('firstName')?.value;
    this.case.lastName = this.caseForm.get('lastName')?.value;
    this.case.weight = this.caseForm.get('weight')?.value;
    this.case.gender = +this.caseForm.get('gender')?.value;
    this.case.age = +this.caseForm.get('age')?.value;

    this.case.containerType = this.caseForm.get('containerType')?.value;
    this.case.containerSize = this.caseForm.get('containerSize')?.value;
    this.case.scheduledDevice = this.caseForm.get('scheduledCremator')?.value;
    this.case.scheduledStartTime = this.caseForm.get('scheduledStartDateTime')?.value;

    this.case.facilityId = this.selectedFacilityId;

    if (this.case.scheduledDevice != '00000000-0000-0000-0000-000000000000' && this.case.scheduledStartTime != '0001-01-01T00:00:00') {
      this.case.status = this.WAITING_FOR_PERMIT; // 4
    }


    if (!this.case.id || this.case.id == '00000000-0000-0000-0000-000000000000') {
      this.caseService.save(this.case).subscribe(response => {
        this.router.navigate([``]);
      });
    } else {
      this.caseService.update(this.case).subscribe(response => {
        this.router.navigate([``]);
      });
    }

  }

  getScheduledStartDateTime(): Date {
    return this.caseForm.get('scheduledStartDateTime')?.value as Date;
  }

  formatDate(date: Date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return year + "-" + month + "-" + day + "T00:00:00";
  }

}
