import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ICase } from './case';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  cases: Observable<string[]>;

  private caseUrlBase = 'https://localhost:44320/Case';

  private casesSub = new BehaviorSubject<string[]>([]);

  constructor(private httpClient: HttpClient) {
    this.cases = this.casesSub.asObservable();
  }

  getCasesNew(): void {
    this.httpClient.get<ICase[]>(this.caseUrlBase)
      .pipe (catchError(this.handleError)).subscribe((cases) => {

        this.casesSub.next(['test']);
      });
  }

  getCases(): Observable<ICase[]> {
    return this.httpClient.get<ICase[]>(this.caseUrlBase)
      .pipe (catchError(this.handleError));
  }

  getCase(id: number): Observable<ICase | undefined> {
    const getCaseUrl = `${this.caseUrlBase}/${id}`;
    return this.httpClient.get<ICase>(getCaseUrl)
      .pipe(catchError(this.handleError));
  }

  createCase(caseToAdd: ICase): Observable<ICase | undefined> {
    return this.httpClient.post<ICase>(this.caseUrlBase, caseToAdd)
      .pipe(catchError(this.handleError));
  }

  updateCase(id: number, caseToUpdate: ICase): Observable<number>{
    const updateCaseUrl = `${this.caseUrlBase}/${id}`;
    return this.httpClient
      .put<number>(updateCaseUrl, caseToUpdate)
      .pipe(catchError(this.handleError));
  }

  deleteCase(caseId: string): Observable<ICase | undefined> {
    const deleteCaseUrl = `${this.caseUrlBase}/${caseId}`;
    return this.httpClient.delete<ICase>(deleteCaseUrl)
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
