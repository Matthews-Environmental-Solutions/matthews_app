/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore} from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Case } from './case';
import { CasePage } from './case.page';
import { CaseService } from './case.service';

export interface CaseState {
    cases: Case[];
}

@Injectable({
  providedIn: 'root'
})
export class CaseStoreService extends ComponentStore<CaseState> {

    constructor(private caseService: CaseService, public modalController: ModalController) {
        super({ cases: []});
    }

    readonly cases$: Observable<Case[]> = this.select(state => state.cases);

    readonly updateCases = this.updater((state: CaseState, cases: Case[]) => ({
            ...state,
            cases: [...cases]
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

    readonly openCaseModal = this.effect<Case>(trigger$ => trigger$.pipe(
      mergeMap((selectedCase) => this.presentModal(selectedCase))
    ));

    async presentModal(selectedCase: Case) {
      const modal = await this.modalController.create({
        component: CasePage,
        componentProps: {
          selectedCase
        }
      });
      return await modal.present();
    }
}
