import { Component, Input, OnInit } from '@angular/core';
import { Subscription, skip } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Case } from 'src/app/models/case.model';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { CaseService } from 'src/app/services/cases.service';
import { FacilityStatusService } from 'src/app/services/facility-status.service';
import { StateService } from 'src/app/services/states.service';
import { CaseInfoDialogComponent } from '../../dialogs/case-info.dialog/case-info.dialog.component';

@Component({
  selector: 'case-calendar-weekly',
  templateUrl: './case-calendar-weekly.component.html',
  styleUrls: ['./case-calendar-weekly.component.scss']
})
export class CaseCalendarWeeklyComponent implements OnInit {

  @Input()
  days!: Date[];

  cases: Case[] = [];
  filteredCases: Case[] = [];
  facilityStatuses: FacilityStatus[] = [];
  selectedFacilityId!: string;
  firstDateInWeek!: Date;
  loader: boolean = false;
  filterDeviceId: string = 'all';

  casesForDay1: Case[] = [];
  casesForDay2: Case[] = [];
  casesForDay3: Case[] = [];
  casesForDay4: Case[] = [];
  casesForDay5: Case[] = [];
  casesForDay6: Case[] = [];
  casesForDay7: Case[] = [];

  private subs = new Subscription();

  constructor(private translate: TranslateService, private caseService: CaseService, private stateService: StateService, private calendarService: CalendarService,
    public dialog: MatDialog, private facilityStatusService: FacilityStatusService) {
  }

  ngOnInit(): void {

    // this.subs.add(this.stateService.selectedFacilityId$.subscribe(f => {
    //   this.selectedFacilityId = f
    // }));

    this.subs.add(
      this.stateService.selectedFacilityId$.subscribe(f => {
        this.selectedFacilityId = f;
        if(f.length > 1)
          this.facilityStatusService.getAllStatusesByFacility(f).subscribe(fStatuses => {
            this.facilityStatuses = fStatuses;
          })
      })
    );

    this.subs.add(this.stateService.firstDateInWeek$.subscribe(d => {
      this.firstDateInWeek = d;
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));

    this.subs.add(this.stateService.devicesFromSite$.pipe(skip(1)).subscribe(devices => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));

    this.subs.add(this.stateService.caseSaved$.pipe(skip(1)).subscribe(data => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));

    this.subs.add(this.stateService.filterCasesByDeviceId$.subscribe(criterium => {
      this.filterDeviceId = criterium;
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));

    // Refresh unscheduled cases list when SignalR sends message
    this.subs.add(this.stateService.refreshCasesList$.pipe(skip(1)).subscribe(data => {
      if (!this.isEmptyString(this.selectedFacilityId) && this.firstDateInWeek) {
        this.getCasesByWeek();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  openCaseInfo(caseSent: Case): void {
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

  getCasesByWeek(): void {
    this.loader = true;

    this.caseService.getScheduledCasesByWeek(this.selectedFacilityId, this.firstDateInWeek).subscribe((response: any) => {
      this.casesForDay1 = [];
      this.casesForDay2 = [];
      this.casesForDay3 = [];
      this.casesForDay4 = [];
      this.casesForDay5 = [];
      this.casesForDay6 = [];
      this.casesForDay7 = [];

      this.cases = response.map((c: any) => {
        if(c.scheduledStartTime && c.scheduledStartTime.includes('1-01-01')
          && c.actualStartTime && !c.actualStartTime.includes('1-01-01')) {
          c.scheduledStartTime = c.actualStartTime;
        }

        return c;
      });
      this.filteredCases = this.filterDeviceId == 'all' ? response : this.cases.filter(c => c.scheduledDevice == this.filterDeviceId);
      this.parseCasesByDays();
      this.stateService.parseCasesByDevices(this.cases);
      this.loader = false;
    });
  }

  parseCasesByDays(): void {
    for (var i = 0; i < this.filteredCases.length; i++) {
      let c = this.filteredCases[i];
      // The "c.scheduledStartTime" is in local (browser) timezone
      let caseScheduledStartTime: Date = c.scheduledStartTime != null ? this.calendarService.getDateInUserProfilesTimezone(new Date(c.scheduledStartTime)) : new Date('0001-01-01T00:00:00');

      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[0])) {
        this.casesForDay1.push(c);
        continue;
      }
      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[1])) {
        this.casesForDay2.push(c);
        continue;
      }
      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[2])) {
        this.casesForDay3.push(c);
        continue;
      }
      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[3])) {
        this.casesForDay4.push(c);
        continue;
      }
      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[4])) {
        this.casesForDay5.push(c);
        continue;
      }
      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[5])) {
        this.casesForDay6.push(c);
        continue;
      }
      if (this.formatDate(caseScheduledStartTime) == this.formatDate(this.days[6])) {
        this.casesForDay7.push(c);
        continue;
      }
    }
  }

  getDayForButton(indexNumber: number): string {
    let currentLang = this.translate.store.currentLang;
    return `${this.days[indexNumber].getDate().toString()} ${this.days[indexNumber].toLocaleString(currentLang, { month: 'short' })}`;
  }

  setTimeToZeros(dateString: string | undefined): string {
    if (dateString == null) {
      return '';
    }
    let splittedDate = dateString.split('T');
    return `${splittedDate[0]} 00:00:00`;
  }

  // formatStringDate(dateString: string | undefined): string {
  //   if (!dateString) {
  //     return '';
  //   }
  //   let date = new Date(dateString); // this line will convert UTC datetime to local
  //   return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  // }

  getIconName(status: number): string {
    switch (status) {
      case 1:
        return 'check_circle';
      case 2:
        return 'local_fire_department';
      case 3:
        return 'arrow_circle_right';
      case 4:
        return 'hourglass_top';
      default:
        return '';
    }
  }

  getIcon(facilityStatus: string | undefined): string {
    const statusObj = this.facilityStatuses.find(status => status.id === facilityStatus) ?? undefined;
    return statusObj ? statusObj.statusIcon : '';
  }

  formatDate(date: Date): string {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return `${year}-${month}-${day} 00:00:00`;
  }

  isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;
}
