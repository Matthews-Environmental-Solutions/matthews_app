import { Component } from '@angular/core';
import { Facility } from '../models/facility.model';
import { Case } from '../models/case.model';
import { AuthService } from '../auth/auth.service';
import { UserInfoAuth } from '../models/userinfo.model';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingDialogComponent } from './dialogs/profile-setting/profile-setting.dialog.component';
import { UserSettingData } from '../models/user-setting.model';
import { UserSettingService } from '../services/user-setting.service';
import { GenderType } from '../enums/gender-type.enum';
import { CaseStatus } from '../enums/case-status.enum';
import { CaseService } from '../services/cases.service';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
})
export class CaseComponent {
  facilities: Facility[] = [
    { value: '1', viewValue: 'Facility 1' },
    { value: '2', viewValue: 'Facility 2' },
    { value: '3', viewValue: 'Facility 3' },
  ];

  // unscheduledCases: Case[] = [
  //   {
  //     id: '', clientId: '', clientCaseId: '834FGF2', facilityId: '', firstName: 'John',
  //     lastName: 'Doe', weight: 79, gender: 1, genderText: '', containerType: 1, containerTypeText: '', containerSize: 'XL',
  //     isObsolete: false, age: 90, status: '0',
  //     scheduledFacility: '', scheduledDevice: '', scheduledDeviceAlias: 'Dev 1', scheduledStartTime: '',
  //     actualFacility: '', actualDevice: '', actualDeviceAlias: '', actualStartTime: '', actualEndTime: '',
  //     createdBy: '', createdTime: '', modifiedBy: '', modifiedTime: '', performedBy: '',
  //     fuel: '', electricity: ''
  //   },
  //   {
  //     id: '', clientId: '', clientCaseId: '824KRB3', facilityId: '', firstName: 'Ekaterina',
  //     lastName: 'Kocsorwa', weight: 16, gender: 2, genderText: '', containerType: 1, containerTypeText: '', containerSize: 'S',
  //     isObsolete: false, age: 16, status: '0',
  //     scheduledFacility: '', scheduledDevice: '', scheduledDeviceAlias: 'Dev 2', scheduledStartTime: '',
  //     actualFacility: '', actualDevice: '', actualDeviceAlias: '', actualStartTime: '', actualEndTime: '',
  //     createdBy: '', createdTime: '', modifiedBy: '', modifiedTime: '', performedBy: '',
  //     fuel: '', electricity: ''
  //   },
  //   {
  //     id: '', clientId: '', clientCaseId: '824KRB3', facilityId: '', firstName: 'Jane',
  //     lastName: 'Tratinelli', weight: 56, gender: 0, genderText: '', containerType: 1, containerTypeText: '', containerSize: 'S',
  //     isObsolete: false, age: 88, status: '0',
  //     scheduledFacility: '', scheduledDevice: '', scheduledDeviceAlias: 'Dev 2', scheduledStartTime: '',
  //     actualFacility: '', actualDevice: '', actualDeviceAlias: '', actualStartTime: '', actualEndTime: '',
  //     createdBy: '', createdTime: '', modifiedBy: '', modifiedTime: '', performedBy: '',
  //     fuel: '', electricity: ''
  //   }
  // ].map(item => {
  //   switch (item.gender) {
  //     case 0:
  //       item.genderText = 'Other';
  //       break;
  //     case 1:
  //       item.genderText = 'Male';
  //       break;
  //     case 2:
  //       item.genderText = 'Female';
  //       break;
  //   }

  //   switch (item.containerType) {
  //     case 0:
  //       item.containerTypeText = 'prvi';
  //       break;
  //     case 1:
  //       item.containerTypeText = 'drugi';
  //       break;
  //     case 2:
  //       item.containerTypeText = 'treci';
  //       break;
  //   }
    

  //   return item;
  // });
  unscheduledCases: Case[] = [];
  loggedInUser: UserInfoAuth | undefined;
  userSetting: UserSettingData | undefined;

  constructor(private authService: AuthService, private userSettingService: UserSettingService, private caseService: CaseService, public dialog: MatDialog) {
    this.loggedInUser = authService.loggedInUser;
    this.userSetting = userSettingService.getUserSettingLastValue();
    caseService.getUnscheduledCases().subscribe(cases => this.unscheduledCases = cases);
  }

  logout(): void {
    this.authService.logout();
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileSettingDialogComponent, {
      data: this.userSetting,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
        localStorage.setItem(result.username, JSON.stringify(result));
        this.userSettingService.setUserSetting(result as UserSettingData);
      }
    });
  }

}
