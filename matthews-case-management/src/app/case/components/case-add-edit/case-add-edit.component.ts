import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { isValid } from 'date-fns'

import { CaseStatusDto } from 'src/app/models/case-status-dto.model';
import { Case } from 'src/app/models/case.model';
import { ContainerType } from 'src/app/models/container-type.model';
import { MtxCalendarView, MtxDatetimepickerMode, MtxDatetimepickerType } from '@ng-matero/extensions/datetimepicker';
import { CaseService } from 'src/app/services/cases.service';
import { map, Subscription } from 'rxjs';
import { StateService } from 'src/app/services/states.service';
import { Device } from 'src/app/models/device.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { TranslateService } from '@ngx-translate/core';
import { WfactorySnackBarService } from 'src/app/components/wfactory-snack-bar/wfactory-snack-bar.service';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { FacilityStatusService } from 'src/app/services/facility-status.service';
import { MatSelectionList } from '@angular/material/list';
import { Facility } from 'src/app/models/facility.model';
import { I4connectedService } from 'src/app/services/i4connected.service';
import { MatSelectChange } from '@angular/material/select';
import { CalendarService } from 'src/app/services/calendar.service';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
import { DeleteDialogComponent } from '../../dialogs/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FacilityService } from 'src/app/services/facility.service';
import { MatButtonToggle } from '@angular/material/button-toggle';

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
  private READY_TO_CREMATE: number = 3;
  private WAITING_FOR_PERMIT: number = 4;
  private GUID_EMPTY: string = '00000000-0000-0000-0000-000000000000';
  private DATETIME_MIN: string = '0001-01-01T00:00:00';

  title: string = 'addNewCase';

  containerTypes: ContainerType[] = [{ id: 0, name: 'None' }, { id: 1, name: 'Cardboard' }, { id: 2, name: 'Hardwood' }, { id: 3, name: 'MDF Particle board' }, { id: 4, name: 'Bag/Shroud' }, { id: 4, name: 'Other' }];

  cremators: Device[] = [];
  facilities: Facility[] = [];
  selectedFacilityId: string = this.GUID_EMPTY;
  facilityStatuses: FacilityStatus[] = [];
  loader: boolean = true;

  caseForm: FormGroup;

  type: MtxDatetimepickerType = 'datetime';
  mode: MtxDatetimepickerMode = 'auto';
  startView: MtxCalendarView = 'month';
  multiYearSelector = false;
  touchUi = false;
  twelvehour = false;
  timeInterval = 1;
  timeInput = true;
  deleteCaseButton = false;

  facilityForm!: FormGroup;

  private subs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private caseService: CaseService,
    private stateService: StateService,
    private router: Router,
    private authService: AuthService,
    private userSettingService: UserSettingService,
    private translate: TranslateService,
    private facilityStatusService: FacilityStatusService,
    private i4connectedService: I4connectedService,
    private calendarService: CalendarService,
    private facilityService: FacilityService,
    private _shackBar: WfactorySnackBarService
  ) {
    this.caseForm = new FormGroup({
      clientCaseId: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      weight: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      age: new FormControl('', [Validators.pattern("^[0-9]*$"), Validators.maxLength(3)]),
      facility: new FormControl('', [Validators.required]),
      scheduledDevice: new FormControl('', { nonNullable: false }),
      containerType: new FormControl('', [Validators.required]),
      scheduledStartDateTime: new FormControl(null),

      facilityStatus: new FormControl('', [Validators.required]),
      physicalId: new FormControl('', { nonNullable: true })
    });

    this.subs.add(this.i4connectedService.getSites()
      .pipe(map(data => data.filter(f => f.isValid)))
      .subscribe(data => {
        this.facilities = data;
      }));

    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.caseForm.get('facility')?.setValue(f);
    }));

    this.twelvehour = this.userSettingService.getUserSettingLastValue().timeformat == '12';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      let id = param.get('id');
      this.title = id == null ? 'addNewCase' : 'editCase';
      if (id) {
        this.getCaseFromApi(id);
        this.deleteCaseButton = true;
      } else {
        this.loader = false;
      }
    });

    // debugger;
    this.facilityForm = this.fb.group({
      facility: new FormControl('')
    });

    const preSelectedFacility = this.stateService.getSelectedFacility();
    console.log(preSelectedFacility);
    if (preSelectedFacility) {
      this.facilityForm.get('facility')!.setValue(preSelectedFacility);
      const syntheticEvent: MatSelectChange = { value: preSelectedFacility, source: null! }; // Create synthetic event
      this.facilityChanged(syntheticEvent); // Call the method with synthetic event
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCaseFromApi(caseId: string): void {
    this.caseService.getCaseById(caseId)
      .subscribe(response => {
        this.case = response;
        this.selectedFacilityId = response.scheduledFacility;
        this.caseForm.get('clientCaseId')?.setValue(response.clientCaseId);
        this.caseForm.get('firstName')?.setValue(response.firstName);
        this.caseForm.get('lastName')?.setValue(response.lastName);
        this.caseForm.get('weight')?.setValue(response.weight);
        this.caseForm.get('gender')?.setValue(response.gender.toString());
        this.caseForm.get('age')?.setValue(response.age == 0 ? '' : response.age);

        this.caseForm.get('facility')?.setValue(response.scheduledFacility);
        this.caseForm.get('scheduledDevice')?.setValue(response.scheduledDevice);
        this.caseForm.get('containerType')?.setValue(response.containerType);

        this.caseForm.get('facilityStatus')?.setValue(response.facilityStatusId);
        this.caseForm.get('physicalId')?.setValue(response.physicalId);

        if (response.scheduledStartTime && response.scheduledStartTime !== this.DATETIME_MIN) {
          let startTime = this.calendarService.getDateInUserProfilesTimezone(response.scheduledStartTime);
          // let startTime = new Date(response.scheduledStartTime);
          if (isValid(startTime)) {
            this.caseForm.get('scheduledStartDateTime')?.setValue(startTime);
          } else {
            this.caseForm.get('scheduledStartDateTime')?.setValue(null);
          }
        }

        if (response.scheduledFacility != undefined && response.scheduledFacility != this.GUID_EMPTY) {
          // this.stateService.setSelectedFacility(response.scheduledFacility);
          this.subs.add(this.facilityStatusService.getAllStatusesByFacility(response.scheduledFacility)
            .subscribe(fStatuses => this.facilityStatuses = fStatuses));

          this.subs.add(this.i4connectedService.getDevicesByFacility2(response.scheduledFacility)
            .subscribe(devices => { this.cremators = devices; this.loader = false; }));

        } else {
          this.router.navigate([``]);
        }
      });
  }

  facilityChanged(facilityId: MatSelectChange): void {
    this.selectedFacilityId = facilityId.value;

    this.subs.add(this.facilityStatusService.getAllStatusesByFacility(this.selectedFacilityId)
      .subscribe(fStatuses => this.facilityStatuses = fStatuses));

    this.subs.add(this.i4connectedService.getDevicesByFacility2(this.selectedFacilityId)
      .subscribe(devices => this.cremators = devices));
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

    if (this.caseForm.get('scheduledDevice')?.value != '') {
      this.case.scheduledDevice = this.cremators.map(c => c.id).includes(this.caseForm.get('scheduledDevice')?.value) ? this.caseForm.get('scheduledDevice')?.value : this.GUID_EMPTY;
      var cremator = this.cremators.find(c => c.id == this.caseForm.get('scheduledDevice')?.value);
      this.case.scheduledDeviceAlias = cremator ? cremator.alias : '';
    } else {
      this.case.scheduledDevice = this.GUID_EMPTY;
    }
    this.case.scheduledStartTime = this.calendarService.getUtcDateFromUserProfileTimezone(this.caseForm.get('scheduledStartDateTime')?.value);
    this.case.scheduledFacility = this.selectedFacilityId.length == 0 ? this.GUID_EMPTY : this.selectedFacilityId;
    this.case.facilityStatusId = (this.caseForm.get('facilityStatus')?.value == '') ? this.GUID_EMPTY : this.caseForm.get('facilityStatus')?.value;
    this.case.physicalId = this.caseForm.get('physicalId')?.value;

    // // set STATUS to UNSCHEDULED
    // if (this.case.scheduledDevice == this.GUID_EMPTY || this.case.scheduledStartTime == null || this.case.scheduledStartTime == this.DATETIME_MIN || this.case.scheduledFacility == this.GUID_EMPTY) {
    //   this.case.status = this.UNSCHEDULED; // 0
    // }

    // // set STATUS to WAITING_FOR_PERMIT
    // if (this.case.scheduledDevice != this.GUID_EMPTY && this.case.scheduledStartTime != null && this.case.scheduledStartTime != this.DATETIME_MIN && this.case.scheduledFacility != this.GUID_EMPTY) {
    //   this.case.status = this.WAITING_FOR_PERMIT; // 4

    //   // set STATUS to READY_TO_CREMATE
    //   var selectedFacilityStatus = this.facilityStatuses.find(fs => fs.id == this.case?.facilityStatusId);
    //   if (selectedFacilityStatus?.startProcess) {
    //     this.case.status = this.READY_TO_CREMATE; // 3
    //   }
    // }

    if (!this.case.id || this.case.id == this.GUID_EMPTY) {
      this.caseService.save(this.case).subscribe({

        next: (response) => {
          this._shackBar.showNotification(this.translate.instant('caseSuccessfullySaved'), 'success');
          this.router.navigate([``]);
          this.stateService.setCaseSavedBehaviorSubject(); // trigger new loading of unscheduled cases
        },

        error: (err) => {
          this._shackBar.showNotification(this.translate.instant(err), 'error');
          //this.router.navigate([``]);
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
          //this.router.navigate([``]);
        }
      });
    }
  }

  openDeleteCaseDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '250px',
      height: '200px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {
        deleteCase: () => this.deleteCase(),
        name: this.case?.firstName,
        surname: this.case?.lastName
      }
    });
  }

  deleteCase() {
    if (this.case?.id !== undefined && this.case?.id !== null) {
      this.caseService.deleteCase(this.case.id).subscribe({
        next: (response) => {
          this._shackBar.showNotification(this.translate.instant('caseSuccessfullyDeleted'), 'success');
          this.router.navigate([``]);
        },
        // error: (err) => {
        //   this._shackBar.showNotification(this.translate.instant(err), 'error');
        //   //this.router.navigate([``]);
        // }
      });
    }
    else {
      this._shackBar.showNotification("No case selected", 'error');
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

  getStartProcessTranslate(startProcess: boolean): string {
    return startProcess ? this.translate.instant('startProcess') : '';
  }

  preventFormSubmit(event: Event): void {
    event.preventDefault();
  }

  handleKeyPress(event: any, toggle: MatButtonToggle) {
    if (event.key === 'Enter') {
      toggle.checked = !toggle.checked;
      // If you need to update the form control value
      this.caseForm?.get('gender')?.setValue(toggle.value);
    }
  }

  trimInput(controlName: string): void {
    const control = this.caseForm.get(controlName);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim());
    }
  }
}
