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

  unscheduledCases: Case[] = [
    {
      id: '', clientId: '', clientCaseId: '834FGF2', facilityId: '', firstName: 'John',
      lastName: 'Doe', weight: 79, gender: '1', containerType: '1', containerSize: 'XL',
      isObsolete: false, age: 90, status: '0',
      scheduledFacility: '', scheduledDevice: '', scheduledDeviceAlias: 'Dev 1', scheduledStartTime: '',
      actualFacility: '', actualDevice: '', actualDeviceAlias: '', actualStartTime: '', actualEndTime: '',
      createdBy: '', createdTime: '', modifiedBy: '', modifiedTime: '', performedBy: '',
      fuel: '', electricity: ''
    },
    {
      id: '', clientId: '', clientCaseId: '824KRB3', facilityId: '', firstName: 'Ekaterina',
      lastName: 'Kocsorwa', weight: 16, gender: '2', containerType: '1', containerSize: 'S',
      isObsolete: false, age: 16, status: '0',
      scheduledFacility: '', scheduledDevice: '', scheduledDeviceAlias: 'Dev 2', scheduledStartTime: '',
      actualFacility: '', actualDevice: '', actualDeviceAlias: '', actualStartTime: '', actualEndTime: '',
      createdBy: '', createdTime: '', modifiedBy: '', modifiedTime: '', performedBy: '',
      fuel: '', electricity: ''
    },
    {
      id: '', clientId: '', clientCaseId: '824KRB3', facilityId: '', firstName: 'Jane',
      lastName: 'Tratinelli', weight: 56, gender: '0', containerType: '1', containerSize: 'S',
      isObsolete: false, age: 88, status: '0',
      scheduledFacility: '', scheduledDevice: '', scheduledDeviceAlias: 'Dev 2', scheduledStartTime: '',
      actualFacility: '', actualDevice: '', actualDeviceAlias: '', actualStartTime: '', actualEndTime: '',
      createdBy: '', createdTime: '', modifiedBy: '', modifiedTime: '', performedBy: '',
      fuel: '', electricity: ''
    }
  ].map(item => {
    switch (item.gender) {
      case '0':
        item.gender = 'Other';
        break;
      case '1':
        item.gender = 'Male';
        break;
      case '2':
        item.gender = 'Female';
        break;
    }

    switch (item.containerType) {
      case '0':
        item.containerType = 'prvi';
        break;
      case '1':
        item.containerType = 'drugi';
        break;
      case '2':
        item.containerType = 'treci';
        break;
    }
    

    return item;
  });

  loggedInUser: UserInfoAuth | undefined;
  userSetting: UserSettingData | undefined;

  constructor(private authService: AuthService, private userSettingService: UserSettingService, public dialog: MatDialog) {
    this.loggedInUser = authService.loggedInUser;
    this.userSetting = userSettingService.getUserSettingLastValue();
    // this.getLoggedInUser();
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

  // getLoggedInUser(): void {
  //   this.authService.loadUserProfile().then(() => {

  //     let userinfoString = localStorage.getItem('id_token_claims_obj');
  //     let jsonLoggedInUser = JSON.parse(userinfoString ? userinfoString : '');

  //     this.loggedInUser = new UserInfoAuth();
  //     this.loggedInUser.copyInto(jsonLoggedInUser);

  //     this.getUserSetting();
  //   });
  // }

  // getUserSetting(): void {
  //   let username = this.loggedInUser && this.loggedInUser.name ? this.loggedInUser.name : undefined;
  //   if (username) {
  //     let setting = localStorage.getItem(username);

  //     let jsonSetting = setting ? JSON.parse(setting) : JSON.parse('{"username": "' + username + '", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24"}');
  //     this.userSetting = new UserSettingData();
  //     this.userSetting.copyInto(jsonSetting);
  //     this.userSettingService.setUserSetting(this.userSetting);
  //   }
  // }

}
