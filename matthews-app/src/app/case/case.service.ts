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
  cases: Observable<string[]>;

  private caseUrlBase = 'https://localhost:44320/Case';
  private prodUrl ='https://develop.comdata.rs/MatthewsApp.API/Case';
  private casesSub = new BehaviorSubject<string[]>([]);

  constructor(private httpClient: HttpClient, private httpService: AuthHttpService) {
    this.cases = this.casesSub.asObservable();
  }

  getCasesNew(): Case[] {
    let casesCollection: Case[] = [];
    this.httpClient.get<Case[]>(this.caseUrlBase)
      .pipe (catchError(this.handleError)).subscribe((cases) => {

        casesCollection = cases;
      });
      return casesCollection;
  }

  getCases() {
    return this.httpService.request<Case[]>("GET", this.prodUrl);
  }
  // getCases(): Observable<Case[]> {
  //   return this.httpClient.get<Case[]>(this.caseUrlBase)
  //     .pipe (catchError(this.handleError));
  // }

  getCase(id: number): Observable<Case | undefined> {
    const getCaseUrl = `${this.caseUrlBase}/${id}`;
    return this.httpClient.get<Case>(getCaseUrl)
      .pipe(catchError(this.handleError));
  }

  createCase(caseToAdd: Case): Observable<Case | undefined> {
    return this.httpClient.post<Case>(this.caseUrlBase, caseToAdd)
      .pipe(catchError(this.handleError));
  }

  updateCase(id: number, caseToUpdate: Case): Observable<number>{
    const updateCaseUrl = `${this.caseUrlBase}/${id}`;
    return this.httpClient
      .put<number>(updateCaseUrl, caseToUpdate)
      .pipe(catchError(this.handleError));
  }

  deleteCase(caseId: string): Observable<Case | undefined> {
    const deleteCaseUrl = `${this.caseUrlBase}/${caseId}`;
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
