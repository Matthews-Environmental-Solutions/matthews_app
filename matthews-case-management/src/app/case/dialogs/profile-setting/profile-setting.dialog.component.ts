import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Language } from 'src/app/models/language.model';
import { UserSettingData } from 'src/app/models/user-setting.model';
import { CalendarService } from 'src/app/services/calendar.service';

@Component({
  selector: 'app-profile-setting.dialog',
  templateUrl: './profile-setting.dialog.component.html',
  styleUrls: ['./profile-setting.dialog.component.scss']
})
export class ProfileSettingDialogComponent implements OnInit {

  languages: Language[] = [
    { id: 'en', name: 'English' },
    { id: 'de', name: 'German' }
  ];

  constructor(
    private calendarService: CalendarService,
    public dialogRef: MatDialogRef<ProfileSettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserSettingData,
  ) { }

  timezones!: string[];

  ngOnInit(): void {
    console.log('data', this.data);
    this.timezones = this.calendarService.getAllTimeZones();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
