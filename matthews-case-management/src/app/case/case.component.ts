import { Component, Inject, OnInit } from '@angular/core';
import { Facility } from '../models/facility.model';
import { Case } from '../models/case.model';
import { AuthService } from '../auth/auth.service';
import { UserInfoAuth } from '../models/userinfo.model';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingDialogComponent } from './dialogs/profile-setting/profile-setting.dialog.component';
import { UserSettingData } from '../models/user-setting.model';
import { UserSettingService } from '../services/user-setting.service';
import { CaseService } from '../services/cases.service';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { I4connectedService } from '../services/i4connected.service';
import { StateService } from '../services/states.service';
import { MatSelectChange } from '@angular/material/select';
import { Subscription, skip } from 'rxjs';
import { Device } from '../models/device.model';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
})
export class CaseComponent implements OnInit {

  facilities: Facility[] = [];
  selectedFacilityId: string = '';
  unscheduledCases: Case[] = [];
  loggedInUser: UserInfoAuth | undefined;
  userSetting: UserSettingData | undefined;

  private subs = new Subscription();

  constructor
    (private authService: AuthService,
      private userSettingService: UserSettingService,
      private caseService: CaseService,
      private i4connectedService: I4connectedService,
      private stateService: StateService,
      public dialog: MatDialog,
      private translate: TranslateService,
      private _adapter: DateAdapter<any>,
      @Inject(MAT_DATE_LOCALE) private _locale: string
    ) {
    this.loggedInUser = authService.loggedInUser;
    this.userSetting = userSettingService.getUserSettingLastValue();
    this.caseService.getUnscheduledCases().subscribe(cases => this.unscheduledCases = cases);
    _adapter.setLocale(this.translate.store.currentLang);
  }
  ngOnInit(): void {
    this.subs.add(this.i4connectedService.getSites().subscribe(data => {
      this.facilities = data;
    }));

    this.subs.add(this.stateService.selectedFacilityId$.pipe(skip(1)).subscribe(fId => {
      this.selectedFacilityId = fId;
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
      }
    });
  }

  facilityChanged(facilityId: MatSelectChange): void {
    this.stateService.setSelectedFacility(facilityId.value);
  }

}
