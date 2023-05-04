import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserSettingData } from 'src/app/models/user-setting.model';

@Component({
  selector: 'app-profile-setting.dialog',
  templateUrl: './profile-setting.dialog.component.html',
  styleUrls: ['./profile-setting.dialog.component.scss']
})
export class ProfileSettingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProfileSettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserSettingData
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
