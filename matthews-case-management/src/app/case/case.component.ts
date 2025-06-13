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
import { Subscription, filter, map, skip } from 'rxjs';
import { WfactorySnackBarService } from '../components/wfactory-snack-bar/wfactory-snack-bar.service';
import { SignalrService } from '../services/signalr.service';
import { UserDetails } from '../models/user-details.model';
import { FacilityService } from '../services/facility.service';
import { DemoService } from '../services/demo.service';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
})
export class CaseComponent implements OnInit {

  facilities: Facility[] = [];
  selectedFacilityId: string = '';
  unscheduledCases: Case[] = [];
  filteredUnscheduledCases: Case[] = [];
  loggedInUser: UserInfoAuth | undefined;
  userSetting: UserSettingData | undefined;
  userDetails: UserDetails = new UserDetails;
  clickedFacilityFilterButton: string = 'bySelectedFacility';
  loader: boolean = false;
  isButtonVisible: boolean = false;
  numberOfUnscheduledCases: number = 0;
  isDemoEntitiesOnly: boolean = false;

  private subs = new Subscription();

  constructor
    (private authService: AuthService,
      private userSettingService: UserSettingService,
      private caseService: CaseService,
      private i4connectedService: I4connectedService,
      private facilityService: FacilityService,
      private stateService: StateService,
      public dialog: MatDialog,
      private translate: TranslateService,
      private _adapter: DateAdapter<any>,
      private _shackBar: WfactorySnackBarService,
      public signalRService: SignalrService,
      public demoService: DemoService,
      @Inject(MAT_DATE_LOCALE) private _locale: string
    ) {
    this.loggedInUser = authService.loggedInUser;
    this.userSetting = userSettingService.getUserSettingLastValue();
    _adapter.setLocale(this.translate.store.currentLang);
  }
  ngOnInit(): void {
    this.subs.add(this.demoService.isUseDemoEntitiesOnly().subscribe(data => {
      console.log('isUseDemoEntitiesOnly', data);
      this.stateService.setIsDemoEntitiesOnly(data);
      this.isDemoEntitiesOnly = data;
    }));

    this.subs.add(this.i4connectedService.getSites()
      .pipe(map(data => data.filter(f => f.isValid)))
      .subscribe(data => {
      this.facilities = data;
      this.userSetting = this.userSettingService.getUserSettingLastValue();
      this.selectedFacilityId = this.userSetting.lastUsedFacilityId;
      this.stateService.setSelectedFacility( this.selectedFacilityId);
      this.caseService.getUnscheduledCases(this.facilities).subscribe(cases => this.filterCases(cases));
      // this.userDetails = this.stateService.getUserDetails();
      // console.log(this.userDetails);

    }));

    this.subs.add(this.stateService.selectedFacilityId$.pipe(skip(1)).subscribe(fId => {
      this.selectedFacilityId = fId;
      this.loader = true;
      this.caseService.getUnscheduledCases(this.facilities).subscribe(cases => {this.filterCases(cases); this.loader = false;});
    }));

    this.subs.add(this.stateService.caseSaved$.pipe(skip(1)).subscribe(c => {
      this.loader = true;
      this.caseService.getUnscheduledCases(this.facilities).subscribe(cases => {this.filterCases(cases); this.loader = false;});
    }));

    this.subs.add(this.stateService.filterUnscheduledCasesByFacilityId$.subscribe(c => {
      this.loader = true;
      this.caseService.getUnscheduledCases(this.facilities).subscribe(cases => {this.filterCases(cases); this.loader = false;});
    }));

    // Refresh unscheduled cases list when SignalR sends message
    this.subs.add(this.stateService.refreshCasesList$.pipe(skip(1)).subscribe(data => {
      this.loader = true;
      this.caseService.getUnscheduledCases(this.facilities).subscribe(cases => {this.filterCases(cases); this.loader = false;});
    }));

    this.subs.add(this.stateService.canActivateFacilityUrl$.pipe(skip(1)).subscribe(permission => {
      this.isButtonVisible = permission;
    }))

    this.signalRService.startConnectionToCaseHub();
    this.signalRService.addCaseDataListener();

    this.i4connectedService.getUserInfoDetails(this.authService.loggedInUser.sub).subscribe(userDetails => {
      var user = new UserDetails();
      user.id = userDetails.id;
      user.firstName = userDetails.firstName;
      user.lastName = userDetails.lastName;
      user.email = userDetails.email;
      user.roles = userDetails.roles;

      this.stateService.setUserDetailsBS(user);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  logout(): void {
    let dateNow = new Date();
    let userSetting = this.userSettingService.getUserSettingLastValue();
    userSetting.lastUsedSelectedDay = dateNow;
    this.setUserSettingToLocalStore(userSetting.username, userSetting);

    this.authService.logout();
  }

  setUserSettingToLocalStore(username: string, userSetting: UserSettingData) {
    localStorage.setItem(username, JSON.stringify(userSetting));
    this.userSettingService.setUserSetting(userSetting);
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileSettingDialogComponent, {
      data: this.userSetting,
    });

    dialogRef.afterClosed().subscribe(
      {
        next: result => {
          if (result) {
            console.log('The dialog was closed', result);
            this._shackBar.showNotification(this.translate.instant('profilSuccessfullySaved'), 'success');
            localStorage.setItem(result.username, JSON.stringify(result));
            this.userSettingService.setUserSetting(result as UserSettingData);
            let languageCode = (result as UserSettingData).language;
            this.translate.use(languageCode);
            this._locale = languageCode;
            this._adapter.setLocale(this._locale);
          }
        },
        error: err => {
          this._shackBar.showNotification(this.translate.instant('profilNotSaved') + ' ' + err, 'error');
        }
      });
  }

  facilityChanged(facilityId: MatSelectChange): void {
    this.stateService.setSelectedFacility(facilityId.value);

    this.userSetting = this.userSettingService.getUserSettingLastValue();
    this.userSetting.lastUsedFacilityId = facilityId.value;
    localStorage.setItem(this.userSetting.username, JSON.stringify(this.userSetting));
    this.userSettingService.setUserSetting(this.userSetting);
  }

  onFacilityFilterClick(facilityIdFilter: 'all' | 'bySelectedFacility') {
    this.clickedFacilityFilterButton = facilityIdFilter;
    this.stateService.setFilterUnscheduledCasesByFacilityId(facilityIdFilter);
  }

  wasIClicked(buttonId: string) {
    return this.clickedFacilityFilterButton == buttonId ? 'selected-button' : 'default-button';
  }  

  filterCases(cases: Case[]){
    this.unscheduledCases = cases;
    this.filteredUnscheduledCases = this.clickedFacilityFilterButton == 'all' ? 
      this.unscheduledCases.filter(c => this.facilities.some(f=> f.id == c.scheduledFacility))
      : 
      this.unscheduledCases.filter(c => c.scheduledFacility == this.selectedFacilityId);

    this.numberOfUnscheduledCases = this.filteredUnscheduledCases.length;
  }
  
}
