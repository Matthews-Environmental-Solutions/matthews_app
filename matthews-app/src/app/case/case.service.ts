import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { Case } from './case';
import { environment } from '../../environments/environment';
import { HttpClient } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { FacilityStatusService } from './facility-status.service';
import { TranslateService } from '@ngx-translate/core';
import { FacilityStatus } from './facility-status.model';
import { Facility } from '../facility/facility';

@Injectable({
  providedIn: 'root'
})
export class CaseService {


  constructor(private httpService: AuthHttpService,
    private translate: TranslateService) {
  }

  getSelectedCaseByDevice(deviceId: string): Promise<Case> {
    const getSelectCaseUrl = `${environment.apiUrl}/Case/GetSelectCaseByDevice/${deviceId}`;
    return this.httpService.request('GET', getSelectCaseUrl, deviceId);
  }

  GetSelectCaseByDevice(deviceId: string): Promise<Case> {
    const getSelectCaseUrl = `${environment.apiUrl}/Case/GetSelectCaseByDevice/${deviceId}`;
    return this.httpService.request('GET', getSelectCaseUrl, deviceId);
  }

  selectCase(caseId: string) {
    const selectCaseUrl = `${environment.apiUrl}/Case/Select`;
    return this.httpService.request('PUT', selectCaseUrl, caseId);
  }

  deselectCase(caseId: string) {
    const deSelectCaseUrl = `${environment.apiUrl}/Case/Deselect`;
    return this.httpService.request('PUT', deSelectCaseUrl, caseId);
  }

  getReadyCasesByDevice(deviceId: string) {
    const getReadyCases = `${environment.apiUrl}/Case/GetReadyCasesByDevice/${deviceId}`;
    return this.httpService.request<Case[]>('GET', getReadyCases, deviceId);
  }

  getNextCaseForDevice(deviceId: string) {
    const getNextCaseUrl = `${environment.apiUrl}/Case/GetNextCaseForDevice/${deviceId}`;
    return this.httpService.request<Case>('GET', getNextCaseUrl, deviceId);
  }

  createCase(caseToAdd: Case) {
    const postCaseUrl = `${environment.apiUrl}/Case/Save`;
    return this.httpService.request<Case>('POST', postCaseUrl, caseToAdd);
  }

  getCase(caseId: string) {
    const getCaseUrl = `${environment.apiUrl}/Case/${caseId}`;
    return this.httpService.request<Case>('GET', getCaseUrl, caseId);
  }

  updateCase(id: string, caseToUpdate: Case) {
    const updateCaseUrl = `${environment.apiUrl}/Case/Update`;
    return this.httpService.request<Case>('PUT', updateCaseUrl, caseToUpdate);
  }

  deleteCase(caseId: string) {
    const deleteCaseUrl = `${environment.apiUrl}/Case/${caseId}`;
    return this.httpService.request<Case>('DELETE', deleteCaseUrl, caseId);
  }

  resetDemo() {
    const resetDemoUrl = `${environment.apiUrl}/Case/ResetDemo`;
    return this.httpService.request<boolean>('GET', resetDemoUrl);
  }



  getScheduledCasesByDay(facilityId: string, date: Date): Promise<Case[]> {

    date.setHours(0, 0, 0, 0);
    let utcStartDate = date.toISOString();

    const getCasesByDayUrl = `${environment.apiUrl}/Case/GetScheduledCasesByDay/${facilityId}/${utcStartDate}`;

    return this.httpService.request<Case[]>('GET', getCasesByDayUrl).then(cases => {
      cases = cases.map(item => this.remapCase(item));
      return cases;
    });
  }

  getScheduledCasesByWeek(facilityId: string, dateStartDateOfWeek: Date): Promise<Case[]> {

    dateStartDateOfWeek.setHours(0, 0, 0, 0);
    let utcStartDateOfWeek = dateStartDateOfWeek.toISOString();

    const getCasesByWeekUrl = `${environment.apiUrl}/Case/GetScheduledCasesByWeek/${facilityId}/${utcStartDateOfWeek}`
    return this.httpService.request<Case[]>('GET', getCasesByWeekUrl);
  }

  getUnscheduledCases(facilities: Facility[]): Promise<Case[]> {
    const url = `${environment.apiUrl}/Case/GetUnscheduledCases`;
    return this.httpService.request<Case[]>('POST', url, facilities);
  }

  remapCase(item: Case): Case {
    switch (item.gender) {

      case 0:
        item.genderText = this.translate.instant('male');
        break;
      case 1:
        item.genderText = this.translate.instant('female');
        break;
      case 2:
        item.genderText = this.translate.instant('other');
        break;
    }

    switch (item.containerType) {
      case 0:
        item.containerTypeText = this.translate.instant('none');
        break;
      case 1:
        item.containerTypeText = this.translate.instant('cardboard');
        break;
      case 2:
        item.containerTypeText = this.translate.instant('hardwood');
        break;
      case 3:
        item.containerTypeText = this.translate.instant('mdfParticleBoard');
        break;
      case 4:
        item.containerTypeText = this.translate.instant('bagShroud');
        break;
      case 5:
        item.containerTypeText = this.translate.instant('other');
        break;
    }

    item.scheduledStartTime = item.scheduledStartTime && item.scheduledStartTime?.length > 0 ? this.formatDateAndTime(item.scheduledStartTime) : '';


    return item;
  }

  formatDateAndTime(date: string): string {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = '' + d.getHours(),
      minute = '' + d.getMinutes(),
      second = '' + d.getSeconds();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    if (hour.length < 2)
      hour = '0' + hour;
    if (minute.length < 2)
      minute = '0' + minute;
    if (second.length < 2)
      second = '0' + second;

    return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;
  }

}
