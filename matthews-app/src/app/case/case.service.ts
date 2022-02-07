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

  getCases() {
    return this.httpService.request<Case[]>('GET', environment.casesApiUrl);
  }

  createCase(caseToAdd: Case) {
    return this.httpService.request<Case>('POST', environment.casesApiUrl, caseToAdd);
  }

  updateCase(id: number, caseToUpdate: Case) {
    const updateCaseUrl = `${environment.casesApiUrl}/${id}`;
    return this.httpService.request<Case>('PUT', updateCaseUrl, caseToUpdate);
  }

  deleteCase(caseId: string) {
    const deleteCaseUrl = `${environment.casesApiUrl}/${caseId}`;
    return this.httpService.request<Case>('DELETE', deleteCaseUrl, caseId);
  }
}
