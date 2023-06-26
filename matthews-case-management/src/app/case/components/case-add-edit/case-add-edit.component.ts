import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { CaseStatus } from 'src/app/models/case-status.model';
import { Case } from 'src/app/models/case.model';
import { ContainerType } from 'src/app/models/container-type.model';
import { ContainerSize } from 'src/app/models/load-size.model';
import { MtxCalendarView, MtxDatetimepickerMode, MtxDatetimepickerType } from '@ng-matero/extensions/datetimepicker';
import { CaseService } from 'src/app/services/cases.service';
import { Subscription } from 'rxjs';
import { StateService } from 'src/app/services/states.service';
import { Device } from 'src/app/models/device.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { TranslateService } from '@ngx-translate/core';
import { WfactorySnackBarService } from 'src/app/components/wfactory-snack-bar/wfactory-snack-bar.service';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { FacilityStatusService } from 'src/app/services/facility-status.service';
import { MatSelectionList } from '@angular/material/list';
import { CaseToFacilityStatus } from 'src/app/models/case-to-facility-status.model';

@Component({
  selector: 'case-add-edit',
  templateUrl: './case-add-edit.component.html',
  styleUrls: ['./case-add-edit.component.scss'],
})
export class CaseAddEditComponent implements OnInit {
  @Input() case?: Case;
  @ViewChild('clickDateHoverMenuTrigger') clickDateHoverMenuTrigger?: MatMenuTrigger;
  @ViewChild('clickTimeHoverMenuTrigger') clickTimeHoverMenuTrigger?: MatMenuTrigger;

  @ViewChild('statuses') statuses?: MatSelectionList;

  private UNSCHEDULED: number = 0;
  private WAITING_FOR_PERMIT: number = 4;
  private GUID_EMPTY: string = '00000000-0000-0000-0000-000000000000';

  title: string = 'addNewCase';

  containerTypes: ContainerType[] = [{ id: 0, name: 'None' }, { id: 1, name: 'Cardboard' }, { id: 2, name: 'Hardwood' }, { id: 3, name: 'MDF Particle board' }, { id: 4, name: 'Bag/Shroud' }, { id: 4, name: 'Other' }];
  containerSizes: ContainerSize[] = [{ id: 0, name: 'None' }, { id: 1, name: 'Infant' }, { id: 2, name: 'Standard' }, { id: 3, name: 'Bariatric' }];
  caseStatuses: CaseStatus[] = [];
  cremators: Device[] = [];
  selectedFacilityId!: string;
  allFacilityStatuses: FacilityStatus[] = [];
  selectedFacilityStatuses: FacilityStatus[] = [];

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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private caseService: CaseService,
    private stateService: StateService,
    private router: Router,
    private authService: AuthService,
    private userSettingService: UserSettingService,
    private translate: TranslateService,
    private facilityStatusService: FacilityStatusService,
    private _shackBar: WfactorySnackBarService
  ) {
    this.caseForm = new FormGroup({
      clientCaseId: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      weight: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      age: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(3)]),
      containerType: new FormControl('', [Validators.required]),
      containerSize: new FormControl('', [Validators.required]),
      status: new FormControl('', { nonNullable: true }),
      scheduledDevice: new FormControl('', { nonNullable: false }),
      burnMode: new FormControl('', { nonNullable: true }),
      scheduledStartDateTime: new FormControl('', { nonNullable: false }),
      selectedFacilityStatuses: new FormControl([], { nonNullable: false })
    });

    this.subs.add(this.stateService.devicesFromSite$.subscribe(devices => this.cremators = devices));

    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.selectedFacilityId = f;
    }));

    this.twelvehour = this.userSettingService.getUserSettingLastValue().timeformat == '12' ?? false;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      let id = param.get('id');
      this.title = id == null ? 'addNewCase' : 'editCase';
      if (id) {
        this.getCaseFromApi(id);
      }
    });

    // this._shackBar.showNotification('Neka poruka', 'warning');

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
        this.caseForm.get('scheduledDevice')?.setValue(response.scheduledDevice);

        if (response.scheduledStartTime && response.scheduledStartTime !== '0001-01-01T00:00:00') {
          this.caseForm.get('scheduledStartDateTime')?.setValue(new Date(response.scheduledStartTime));
        }

        if (response.scheduledFacility != undefined) {
          this.subs.add(this.facilityStatusService.getAllStatusesByFacility(response.scheduledFacility)
            .subscribe(fStatuses => this.allFacilityStatuses = fStatuses));
        }
      });
  }

  isStatusSelected(facilityStatus: FacilityStatus): boolean {
    let status = this.case?.caseToFacilityStatuses.find(f => f.facilityStatusId == facilityStatus.id);
    return (status != null) ? true : false;
  }

  save() {
    console.log('SAVE', this.caseForm.value);

    if (!this.case) {
      this.case = new Case();
      this.case.id = this.GUID_EMPTY;
      this.case.createdBy = this.authService.loggedInUser.sub;
      this.case.createdTime = this.formatDate(new Date());
    } else {
      this.case.modifiedBy = this.authService.loggedInUser.sub;
      this.case.modifiedTime = this.formatDate(new Date());
    }

    this.case.clientCaseId = this.caseForm.get('clientCaseId')?.value;
    this.case.firstName = this.caseForm.get('firstName')?.value;
    this.case.lastName = this.caseForm.get('lastName')?.value;
    this.case.weight = this.caseForm.get('weight')?.value;
    this.case.gender = +this.caseForm.get('gender')?.value;
    this.case.age = +this.caseForm.get('age')?.value;

    this.case.containerType = this.caseForm.get('containerType')?.value;
    this.case.containerSize = this.caseForm.get('containerSize')?.value;

    this.case.scheduledDevice = (this.caseForm.get('scheduledDevice')?.value == '') ? this.GUID_EMPTY : this.caseForm.get('scheduledDevice')?.value;
    this.case.scheduledStartTime = this.caseForm.get('scheduledStartDateTime')?.value;
    this.case.scheduledFacility = this.selectedFacilityId.length == 0 ? this.GUID_EMPTY : this.selectedFacilityId;
    this.selectedFacilityStatuses = this.caseForm.get('selectedFacilityStatuses')?.value;

    this.case.caseToFacilityStatuses.map(s => s.isDone = false);
    this.selectedFacilityStatuses.forEach(selected => {
      if (!this.case) return;

      let founded = this.case.caseToFacilityStatuses.find(f => f.facilityStatusId == selected.id);
      if (founded) {
        founded.isDone = true;
        founded.ModifiedBy = this.authService.loggedInUser.sub;
        founded.ModifiedTime = this.formatDate(new Date());
      } else {
        let fStatus = new CaseToFacilityStatus();
        fStatus.caseId = this.case?.id;
        fStatus.facilityStatusId = selected.id
        fStatus.isDone = true;
        fStatus.createdBy = this.authService.loggedInUser.sub;
        fStatus.createdTime = this.formatDate(new Date());
        this.case?.caseToFacilityStatuses.push(fStatus);
      }

    });

    // set STATUS to UNSCHEDULED
    if (this.case.scheduledDevice == this.GUID_EMPTY || this.case.scheduledStartTime == '0001-01-01T00:00:00' || this.case.scheduledFacility == this.GUID_EMPTY){
      this.case.status = this.UNSCHEDULED; // 0
    }

    // set STATUS to WAITING_FOR_PERMIT
    if (this.case.scheduledDevice != this.GUID_EMPTY && this.case.scheduledStartTime != '0001-01-01T00:00:00' && this.case.scheduledFacility != this.GUID_EMPTY) {
      this.case.status = this.WAITING_FOR_PERMIT; // 4
    }

    if (!this.case.id || this.case.id == this.GUID_EMPTY) {
      this.caseService.save(this.case).subscribe({

        next: (response) => {
          this._shackBar.showNotification(this.translate.instant('caseSuccessfullySaved'), 'success');
          this.router.navigate([``]);
          this.stateService.setCaseSavedBehaviorSubject(); // trigger new loading of unscheduled cases
        },

        error: (err) => {
          this._shackBar.showNotification(this.translate.instant(err), 'error');
          this.router.navigate([``]);
        }
      });
    } else {
      this.caseService.update(this.case).subscribe({
        next: (response) => {
          this._shackBar.showNotification(this.translate.instant('caseSuccessfullyUpdated'), 'success');
          this.router.navigate([``]);
          this.stateService.setCaseSavedBehaviorSubject(); // trigger new loading of unscheduled cases
        },

        error: (err) => {
          this._shackBar.showNotification(this.translate.instant(err), 'error');
          this.router.navigate([``]);
        }
      });
    }
  }

  getScheduledStartDateTime(): Date {
    return this.caseForm.get('scheduledStartDateTime')?.value as Date;
  }

  formatDate(date: Date): string {
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
