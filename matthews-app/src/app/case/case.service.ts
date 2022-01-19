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
  constructor(private httpClient: HttpClient, private httpService: AuthHttpService) {
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

  deleteCase(caseId: string): Observable<Case | undefined> {
    const deleteCaseUrl = `${this.prodUrl}/${caseId}`;
    return this.httpClient.delete<Case>(deleteCaseUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
