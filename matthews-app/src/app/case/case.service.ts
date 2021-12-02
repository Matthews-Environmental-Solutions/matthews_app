import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ICase } from './case';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  // cases: ICase[];
  private productUrl = '../../assets/cases.json';
  constructor(private httpClient: HttpClient) { }

  getCases(): Observable<ICase[]> {
    return this.httpClient.get<ICase[]>(this.productUrl)
      .pipe(
        tap(data => console.log('All: ', JSON.stringify(data)))
      );
  }

  getCase(id: string): Observable<ICase | undefined> {
    return this.getCases()
      .pipe(
        map((cases: ICase[]) => cases.find(c => c.caseId === id))
      );
  }
}
