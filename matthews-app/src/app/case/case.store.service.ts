/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { ComponentStore} from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Case } from './case';
import { CaseService } from './case.service';

export interface CaseState {
    cases: Case[];
    caseId: number;
    selectedCase: Case;
}

@Injectable({
  providedIn: 'root'
})
export class CaseStoreService extends ComponentStore<CaseState> {

    constructor(private caseService: CaseService) {
        super({ cases: [], selectedCase: new Case(), caseId: 0});
    }

    readonly cases$: Observable<Case[]> = this.select(state => state.cases);
    readonly selectedCase$: Observable<Case> = this.select((state) => state.selectedCase);

    readonly updateCases = this.updater((state: CaseState, cases: Case[]) => ({
            ...state,
            cases: [...cases]
      }));

    readonly updateCaseId = this.updater((state: CaseState, selectedCaseId: number) => ({
        ...state,
        caseId: selectedCaseId,
        selectedCase: selectedCaseId ? state.cases.find(c => c.id === selectedCaseId) : new Case()
      }));

    readonly getCases = this.effect(trigger$ => trigger$.pipe (
      switchMap(() => this.caseService.getCases().pipe(
          tap({
            next: (response) => {
              this.updateCases(response);
            },
            error: () => {
            }
          }),
          catchError(() => EMPTY)
        ))
    ));

    readonly deleteCase = this.effect<string>(case$ => case$.pipe (
      mergeMap ((caseId) => this.caseService.deleteCase(caseId).pipe(
        tap({
          next: () => {
            this.getCases();
          },
          error: () => {

          }
        }),
        catchError(() => EMPTY)
      ))
    ));

    readonly createCase = this.effect<Case>(case$ => case$.pipe (
      mergeMap ((selectedCase) => this.caseService.createCase(selectedCase).pipe(
        tap({
          next: () => {
            this.getCases();
          },
          error: () => {

          }
        }),
        catchError(() => EMPTY)
      ))
    ));

    readonly updateCase = this.effect<Case>(case$ => case$.pipe(
      mergeMap((selectedCase) => this.caseService.updateCase(selectedCase.id, selectedCase).pipe(
        tap({
          next: () => {
            this.getCases();
          },
          error: () => {

          }
        }),
        catchError(() => EMPTY)
      ))
    ));
}
