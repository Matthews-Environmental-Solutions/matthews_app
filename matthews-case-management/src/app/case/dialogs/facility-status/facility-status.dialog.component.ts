import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { Icon } from 'src/app/models/icon.model';
import { FacilityStatusService } from 'src/app/services/facility-status.service';

@Component({
  selector: 'app-facility-status.dialog',
  templateUrl: './facility-status.dialog.component.html',
  styleUrls: ['./facility-status.dialog.component.scss']
})
export class FacilityStatusDialogComponent implements OnInit {

  private GUID_EMPTY: string = '00000000-0000-0000-0000-000000000000';
  title!: string;
  statusForm: FormGroup;
  icons: Icon[] = [];

  constructor(
    public dialogRef: MatDialogRef<FacilityStatusDialogComponent>,
    private translate: TranslateService,
    private authService: AuthService,
    private facilityStatusService: FacilityStatusService,
    @Inject(MAT_DIALOG_DATA) public data: FacilityStatus) {

/**
 * createdBy!: string; //GUID
    createdTime!: Date;
    modifiedBy!: string; //GUID
    modifiedTime!: Date;
    facilityId!: string;
    statusCode!: number;
    statusName!: string;
    statusIcon!: string;
    startProcess!: boolean;
 * / */

      this.statusForm = new FormGroup({
        statusCode: new FormControl(data.statusCode, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(4)]),
        statusName: new FormControl(data.statusName, [Validators.required]),
        statusIcon: new FormControl(data.statusIcon, [Validators.required]),
        startProcess: new FormControl(data.startProcess, [Validators.required])
      });


     }

  ngOnInit(): void {
    console.log('data', this.data);
    this.title = this.data.id == this.GUID_EMPTY ? this.translate.instant('addNewFacilityStatus') : this.translate.instant('editFacilityStatus');
    this.facilityStatusService.getIconsFromJsonFile().subscribe(icons => this.icons = icons);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save () {
    if (this.data.id == this.GUID_EMPTY) {
      this.data.createdBy = this.authService.loggedInUser.sub;
      this.data.createdTime = this.formatDate(new Date());
    } else {
      this.data.modifiedBy = this.authService.loggedInUser.sub;
      this.data.modifiedTime = this.formatDate(new Date());
    }

    this.data.statusCode = this.statusForm.get('statusCode')?.value;
    this.data.statusName = this.statusForm.get('statusName')?.value;
    this.data.statusIcon = this.statusForm.get('statusIcon')?.value;
    this.data.startProcess = this.statusForm.get('startProcess')?.value;
    this.dialogRef.close(this.data);
  }

  onIconClick(iconKey: string) {
    this.statusForm.get('statusIcon')?.setValue(iconKey);
    this.data.statusIcon = iconKey;
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
