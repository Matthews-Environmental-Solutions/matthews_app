import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthHttpService } from '../core/auth-http.service';
import { Case } from './case';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private prodUrl = 'https://develop.comdata.rs/MatthewsApp.API/Case';
  constructor(private httpService: AuthHttpService) {
  }

  getCases() {
    return this.httpService.request<Case[]>('GET', this.prodUrl);
  }

  createCase(caseToAdd: Case) {
    return this.httpService.request<Case>('POST', this.prodUrl, caseToAdd);
  }

  updateCase(id: number, caseToUpdate: Case) {
    const updateCaseUrl = `${this.prodUrl}/${id}`;
    return this.httpService.request<Case>('PUT', updateCaseUrl, caseToUpdate);
  }

  deleteCase(caseId: string) {
    const deleteCaseUrl = `${this.prodUrl}/${caseId}`;
    return this.httpService.request<Case>('DELETE', deleteCaseUrl, caseId);
  }
}
