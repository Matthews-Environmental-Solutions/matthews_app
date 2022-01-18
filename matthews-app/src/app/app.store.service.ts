/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore} from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Case } from './case/case';
import { CasePage } from './case/case.page';
import { CaseService } from './case/case.service';
import { IFacility } from './facility/facility';
import { FacilityService } from './facility/facility.service';

export interface AppState {
    cases: Case[];
    facilities: IFacility[];
    loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppStoreService extends ComponentStore<AppState> {

    constructor(private caseService: CaseService, private facilitiesService: FacilityService, public modalController: ModalController) {
        super({ cases: [], facilities: [], loading: false});
    }

    readonly cases$: Observable<Case[]> = this.select(state => state.cases);

    readonly facilities$: Observable<IFacility[]> = this.select(state => state.facilities);

    readonly loading$: Observable<boolean> = this.select(state => state.loading);

    readonly vm$ = this.select(
      this.cases$,
      this.facilities$,
      this.loading$,
      (cases, facilities, loading) => ({
        cases,
        facilities,
        loading
      })
    );

    readonly updateFacilities = this.updater((state: AppState, facilities: IFacility[]) => ({
      ...state,
      facilities: [...facilities]
    }));

    readonly updateCases = this.updater((state: AppState, cases: Case[]) => ({
            ...state,
            cases: [...cases]
      }));

    readonly updateLoading = this.updater((state: AppState, loading: boolean) => ({
          ...state,
          loading
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

    readonly getFacilities = this.effect(trigger$ => trigger$.pipe(
      tap(() => this.updateLoading(true)),
      switchMap(() => this.facilitiesService.getFacilities().then(
        (response: IFacility[]) => {
          this.updateFacilities(response);
          this.updateLoading(false);
        }))
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
