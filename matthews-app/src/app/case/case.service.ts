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
    const getScheduleUrl = `${environment.casesApiUrl}/GetAllCasesByFacility/${facilityId}`;
    return this.httpService.request<Case[]>('GET', getScheduleUrl, facilityId);
  }

  createCase(caseToAdd: Case) {
    const postCaseUrl = `${environment.casesApiUrl}/Save`;
    return this.httpService.request<Case>('POST', postCaseUrl, caseToAdd);
  }

  updateCase(id: string, caseToUpdate: Case) {
    const updateCaseUrl = `${environment.casesApiUrl}/Update`;
    return this.httpService.request<Case>('PUT', updateCaseUrl, caseToUpdate);
  }

  deleteCase(caseId: string) {
    const deleteCaseUrl = `${environment.casesApiUrl}/${caseId}`;
    return this.httpService.request<Case>('DELETE', deleteCaseUrl, caseId);
  }
}
