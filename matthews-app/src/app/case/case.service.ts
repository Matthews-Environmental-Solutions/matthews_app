import { Injectable } from '@angular/core';
import { AuthHttpService } from '../core/auth-http.service';
import { Case } from './case';
import { environment } from '../../environments/environment';

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
}
