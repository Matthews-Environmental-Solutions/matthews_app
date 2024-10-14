import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { Case } from './case';
import { environment } from '../../environments/environment';
import { HttpClient } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CaseService {


  constructor(private httpService: AuthHttpService) {
  }

  getCases(facilityId: string) {
    const getScheduleUrl = `${environment.apiUrl}/Case/GetAllCasesByFacility/${facilityId}`;
    return this.httpService.request<Case[]>('GET', getScheduleUrl, facilityId);
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
    return this.httpService.request<Case[]>('GET', getCasesByDayUrl);

  }

  getScheduledCasesByWeek(facilityId: string, dateStartDateOfWeek: Date): Promise<Case[]> {
    
    dateStartDateOfWeek.setHours(0, 0, 0, 0);
    let utcStartDateOfWeek = dateStartDateOfWeek.toISOString();

    const getCasesByWeekUrl = `${environment.apiUrl}/Case/GetScheduledCasesByWeek/${facilityId}/${utcStartDateOfWeek}`
    return this.httpService.request<Case[]>('GET', getCasesByWeekUrl);
  }


}
