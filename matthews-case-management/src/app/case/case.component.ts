import { ChangeDetectorRef, Component, Inject } from '@angular/core';
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
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

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

  unscheduledCases: Case[] = [];
  loggedInUser: UserInfoAuth | undefined;
  userSetting: UserSettingData | undefined;

  constructor
    (private authService: AuthService,
      private userSettingService: UserSettingService,
      private caseService: CaseService,
      public dialog: MatDialog,
      private translate: TranslateService,
      private _adapter: DateAdapter<any>,
      @Inject(MAT_DATE_LOCALE) private _locale: string,
      private changeDetectorRef: ChangeDetectorRef
    ) {
    this.loggedInUser = authService.loggedInUser;
    this.userSetting = userSettingService.getUserSettingLastValue();
    caseService.getUnscheduledCases().subscribe(cases => this.unscheduledCases = cases);
    _adapter.setLocale(this.translate.store.currentLang);
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
        let languageCode = (result as UserSettingData).language;
        this.translate.use(languageCode);
        this._locale = languageCode;
        this._adapter.setLocale(this._locale);
        setTimeout(() => {
          this.changeDetectorRef.detectChanges();
        }, 500);
      }
    });
  }

}
