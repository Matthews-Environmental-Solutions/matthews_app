import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, of, skip, take } from 'rxjs';
import { Case } from 'src/app/models/case.model';
import { CaseService } from 'src/app/services/cases.service';
import { StateService } from 'src/app/services/states.service';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { CaseDetailsDialogComponent } from '../../dialogs/case-details/case-details.dialog.component';
import { FacilityStatusService } from 'src/app/services/facility-status.service';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { CaseInfoDialogComponent } from '../../dialogs/case-info.dialog/case-info.dialog.component';


@Component({
  selector: 'case-calendar-daily',
  templateUrl: './case-calendar-daily.component.html',
  styleUrls: ['./case-calendar-daily.component.scss']
})
export class CaseCalendarDailyComponent implements OnInit {

  @Input()
  days!: Date[];

  @Output() selectedDayChange = new EventEmitter<Date>();

  cases: Case[] = [];
  filteredCases: Case[] = [];
  facilityStatuses: FacilityStatus[] = [];
  selectedDay!: Date;
  selectedFacilityId!: string;
  filterDeviceId: string = 'all';

  buttonUsed: number = 0;
  iconName: string = 'check_circle';
  statusDescription: string = 'cremation complete';
  loader: boolean = false;

  private subs = new Subscription();

  constructor(
    private translate: TranslateService,
    private caseService: CaseService,
    private stateService: StateService,
    private userSettingService: UserSettingService,
    public dialog: MatDialog,
    private facilityStatusService: FacilityStatusService,
    private router: Router) {
  }

  ngOnInit(): void {

    this.stateService.setSelectedDate(new Date(this.userSettingService.getUserSettingLastValue().lastUsedSelectedDay));

    this.subs.add(this.userSettingService.userSettings$.subscribe(s => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
      this.selectedFacilityId = f;
      if(f.length > 1)
        this.facilityStatusService.getAllStatusesByFacility(f).subscribe(fStatuses => {
          this.facilityStatuses = fStatuses;
        })
    }));

    this.subs.add(this.stateService.selectedDate$.subscribe(d => {
      // d.setHours(0, 0, 0, 0);
      this.selectedDay = d;
      this.checkHeaderDayButtons();

      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    this.subs.add(this.stateService.devicesFromSite$.subscribe(devices => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    this.subs.add(this.stateService.caseSaved$.pipe(skip(1)).subscribe(data => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    this.subs.add(this.stateService.filterCasesByDeviceId$.subscribe(criterium => {
      this.filterDeviceId = criterium;
      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));

    // Refresh unscheduled cases list when SignalR sends message
    this.subs.add(this.stateService.refreshCasesList$.pipe(skip(1)).subscribe(data => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.selectedDay) {
        this.getCasesByDate();
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDay'] || changes['days']) {
      this.checkHeaderDayButtons();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCasesByDate() {
    this.loader = true;
    this.caseService.getScheduledCasesByDay(this.selectedFacilityId, this.selectedDay).subscribe((response: any) => {
      this.cases = response;
      this.filteredCases = this.filterDeviceId == 'all' ? response : this.cases.filter(c => c.scheduledDevice == this.filterDeviceId);
      this.stateService.parseCasesByDevices(this.cases);
      this.loader = false;
    });
  }

  checkHeaderDayButtons() {
    let dayToCompare = new Date(this.selectedDay);
    dayToCompare.setHours(0, 0, 0, 0);
    let index = this.days.map(Number).indexOf(+dayToCompare);
    this.buttonUsed = index;
  }

  getDayForButton(indexNumber: number): string {
    let currentLang = this.translate.store.currentLang;
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString(currentLang, { month: 'short' })}`;
  }

  dayClick(dayIndex: number) {
    var dayClicked = new Date(this.days[dayIndex]);
    dayClicked.setHours(12, 0, 0, 0);

    this.stateService.setSelectedDate(dayClicked);
    this.changeSelectedDay(dayClicked);
    this.buttonUsed = dayIndex;

    let userSetting = this.userSettingService.getUserSettingLastValue();
    userSetting.lastUsedSelectedDay = dayClicked;
    localStorage.setItem(userSetting.username, JSON.stringify(userSetting));
    this.userSettingService.setUserSetting(userSetting);
  }

  changeSelectedDay(value: Date) {
    this.selectedDayChange.emit(value);
  }

  gotoCaseEdit(caseId: string) {
    this.router.navigate([`case/${caseId}`]);
  }

  getIcon(facilityStatus: string | undefined): string {
    const statusObj = this.facilityStatuses.find(status => status.id === facilityStatus) ?? undefined;
    return statusObj ? statusObj.statusIcon : '';
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;

  openCaseDetails(caseSent: Case): void {
    const dialogRef = this.dialog.open(CaseInfoDialogComponent, {
          data: caseSent,
          height: '400px',
          width: '300px',
          autoFocus: false
        });

      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
  }

  getGeneralCaseStatus(facilityStatusId: string): number {
    let status = this.facilityStatuses.find(s => s.id == facilityStatusId);
    return status ? status.status : NaN;
  }

}
