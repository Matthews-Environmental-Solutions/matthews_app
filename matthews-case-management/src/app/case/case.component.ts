import { ChangeDetectorRef, Component } from '@angular/core';
import { Facility } from '../models/facility.model';
import { Case } from '../models/case.model';
import { AuthService } from '../auth/auth.service';
import { UserInfo } from '../models/userinfo.model';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingDialogComponent } from './dialogs/profile-setting/profile-setting.dialog.component';
import { UserSettingData } from '../models/user-setting.model';

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
    new Case("834FGF2", "John", "Doe", 79, "Cardboard", "Male", "Dev 2"),
    new Case("824KRB3", "Ekaterina", "Kocsorwa", 16, "Hardwood", "Child", "Dev 2"),
    new Case("824KRB4", "Jane", "Tratinelli", 56, "Hardwood", "Fimale", "Dev 2"),
    new Case("834FGF2", "John", "Doe", 79, "Cardboard", "Male", "Dev 2"),
    new Case("824KRB3", "Ekaterina", "Kocsorwa", 16, "Hardwood", "Child", "Dev 2"),
    new Case("824KRB4", "Jane", "Tratinelli", 56, "Hardwood", "Fimale", "Dev 2"),
    new Case("834FGF2", "John", "Doe", 79, "Cardboard", "Male", "Dev 2"),
    new Case("824KRB3", "Ekaterina", "Kocsorwa", 16, "Hardwood", "Child", "Dev 2"),
    new Case("824KRB4", "Jane", "Tratinelli", 56, "Hardwood", "Fimale", "Dev 2")
  ];

  loggedInUser: UserInfo | undefined;
  userSetting: UserSettingData | undefined;
  
  constructor(private authService: AuthService, public dialog: MatDialog) {
    this.getLoggedInUser();
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
      }
    });
  }

  getLoggedInUser(): void {
    this.authService.loadUserProfile().then(() => {

      let userinfoString = localStorage.getItem('id_token_claims_obj');
      let jsonLoggedInUser = JSON.parse(userinfoString ? userinfoString : '');

      this.loggedInUser = new UserInfo();
      this.loggedInUser.copyInto(jsonLoggedInUser);

      this.getUserSetting();
    });
  }

  getUserSetting(): void {
    let username = this.loggedInUser && this.loggedInUser.name ? this.loggedInUser.name : undefined;
    if (username) {
      let setting = localStorage.getItem(username);

      let jsonSetting = setting ? JSON.parse(setting) : JSON.parse('{"username": "' + username + '", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24"}');
      this.userSetting = new UserSettingData();
      this.userSetting.copyInto(jsonSetting);
    }
  }

}
