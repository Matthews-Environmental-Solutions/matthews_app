/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore} from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { CaseListPage } from './case-list/case-list.page';
import { Case } from './case/case';
import { CasePage } from './case/case.page';
import { CaseService } from './case/case.service';
import { Device } from './device-list/device';
import { DeviceListService } from './device-list/device-list.service';
import { Facility } from './facility/facility';
import { FacilityService } from './facility/facility.service';
import { UserInfo } from './core/userInfo'

export interface AppState {
    cases: Case[];
    selectedCase: Case;
    facilities: Facility[];
    loading: boolean;
    deviceList: Device[];
    userInfo: UserInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AppStoreService extends ComponentStore<AppState> {

    constructor(private caseService: CaseService, private facilitiesService: FacilityService, private deviceListService: DeviceListService, public modalController: ModalController) {
        super({ cases: [], selectedCase: {} as Case, facilities: [], loading: false,  deviceList: [], userInfo: {} as UserInfo});
    }

    readonly cases$: Observable<Case[]> = this.select(state => state.cases);
    readonly selectedCase$: Observable<Case> = this.select(state => state.selectedCase);
    readonly facilities$: Observable<Facility[]> = this.select(state => state.facilities);
    readonly deviceList$: Observable<Device[]> = this.select(state => state.deviceList);
    readonly loading$: Observable<boolean> = this.select(state => state.loading);
    readonly userInfo$: Observable<UserInfo> = this.select(state => state.userInfo);

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

    readonly updateFacilities = this.updater((state: AppState, facilities: Facility[]) => ({
      ...state,
      facilities: [...facilities]
    }));

    readonly updateDeviceList = this.updater((state: AppState, device: Device) => ({
      ...state,
      deviceList: [...state.deviceList, device]
    }));

    readonly updateCases = this.updater((state: AppState, cases: Case[]) => ({
            ...state,
            cases: [...cases]
      }));

      readonly updateSelectedCase = this.updater((state: AppState, selectedCase: Case) => ({
        ...state,
        selectedCase
  }));

  readonly updateUserInfo = this.updater((state: AppState, userInfo: UserInfo) => ({
    ...state,
    userInfo
  }));

    readonly updateLoading = this.updater((state: AppState, loading: boolean) => ({
          ...state,
          loading
    }));

    readonly getFacilities = this.effect(trigger$ => trigger$.pipe(
      tap(() => this.updateLoading(true)),
      switchMap(() => this.facilitiesService.getFacilities().then(
        (response: Facility[]) => {
          this.updateFacilities(response);
          this.updateLoading(false);
        }))
    ));

    readonly getDeviceList = this.effect<string>(trigger$ => trigger$.pipe(
      switchMap((facilityId) => this.deviceListService.getDeviceIdsByFacilityId(facilityId).then(
        (response: string[]) => {
         this.clearDevicesFromState();
          response.forEach(id => this.deviceListService.getDeviceNameById(id).then(
            (name: string) => {
              this.updateDeviceList({id, name});
            }
          ));
        }))
    ));

    readonly getCases = this.effect(trigger$ => trigger$.pipe(
      tap(() => this.updateLoading(true)),
      switchMap(() => this.caseService.getCases().then(
        (response: Case[]) => {
          this.updateCases(response);
          this.updateLoading(false);
        }))
    ));

    readonly createCase = this.effect<Case>(case$ => case$.pipe(
      tap(() => this.updateLoading(true)),
      switchMap((selectedCase) => this.caseService.createCase(selectedCase).then(
        () => {
          this.getCases();
          this.updateLoading(false);
        }))
    ));

    readonly updateCase = this.effect<Case>(case$ => case$.pipe(
      tap(() => this.updateLoading(true)),
      switchMap((selectedCase) => this.caseService.updateCase(selectedCase.id, selectedCase).then(
        () => {
          this.getCases();
          this.updateLoading(false);
        }))
    ));

    readonly getUserInfo = this.effect<string>(trigger$ => trigger$.pipe(
      switchMap((userInfo) => this.facilitiesService.getUserInfo(userInfo).then(
        (response: UserInfo) => {
          // this.facilitiesService.getAttachment(response.photoId).then(
          //   (attachment) => {
          //     // response.photo = btoa(attachment.stream.toString());
          //   }
          // )
          this.updateUserInfo(response);
          console.log(JSON.stringify(response));
        }))
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

    readonly openCasesModal = this.effect(trigger$ => trigger$.pipe(
      mergeMap(() => this.presentCasesModal())
    ));

    async presentCasesModal() {
      const modal = await this.modalController.create({
        component: CaseListPage
      });
      return await modal.present();
    }

    clearDevicesFromState() {
      this.setState((currentState) => ({
          ...currentState,
          deviceList: []
        }));
    }
}
