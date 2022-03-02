/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore} from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { CaseListPage } from './case-list/case-list.page';
import { Case } from './case/case';
import { CasePage } from './case/case.page';
import { CaseService } from './case/case.service';
import { Device } from './device-list/device';
import { DeviceListService } from './device-list/device-list.service';
import { Facility } from './facility/facility';
import { FacilityService } from './facility/facility.service';
import { UserInfo } from './core/userInfo';
import { AuthService } from 'ionic-appauth';
import { LoadingService } from './core/loading.service';
import { CremationProcessService } from './cremation-process/cremation-process.service';
import { SignalRService } from './core/signal-r.service';

export interface AppState {
    cases: Case[];
    selectedCase: Case;
    facilities: Facility[];
    loading: boolean;
    deviceList: Device[];
    userInfo: UserInfo;
    selectedCrematorName: string;
    selectedFacility: Facility;
    primaryTemp: string;
    secondaryTemp: string;
    ewonPreheat: string;
}

export interface Measurement {
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStoreService extends ComponentStore<AppState> {

    constructor(private auth: AuthService,
    		        private caseService: CaseService,
                private facilitiesService: FacilityService,
                private deviceListService: DeviceListService,
                private cremationProcessService: CremationProcessService,
                public modalController: ModalController,
                private loadingService: LoadingService,
                private signalRService: SignalRService) {

            super({ cases: [],
                    selectedCase: {} as Case,
                    facilities: [],
                    loading: false,
                    deviceList: [],
                    userInfo: {} as UserInfo,
                    selectedCrematorName: '',
                    selectedFacility: {} as Facility,
                    primaryTemp: '',
                    secondaryTemp: '',
                    ewonPreheat: ''});
    }

    readonly cases$: Observable<Case[]> = this.select(state => state.cases);
    readonly selectedCase$: Observable<Case> = this.select(state => state.selectedCase);
    readonly facilities$: Observable<Facility[]> = this.select(state => state.facilities);
    readonly deviceList$: Observable<Device[]> = this.select(state => state.deviceList);
    readonly loading$: Observable<boolean> = this.select(state => state.loading);
    readonly userInfo$: Observable<UserInfo> = this.select(state => state.userInfo);
    readonly selectedCrematorName$: Observable<string> = this.select(state => state.selectedCrematorName);
    readonly selectedFacility$: Observable<Facility> = this.select(state => state.selectedFacility);
    readonly primaryTemp$: Observable<string> = this.select(state => state.primaryTemp);
    readonly secondaryTemp$: Observable<string> = this.select(state => state.secondaryTemp);
    readonly ewonPreheat$: Observable<string> = this.select(state => state.ewonPreheat);

    readonly scheduleVm$ = this.select(
      this.cases$,
      this.selectedCase$,
      this.facilities$,
      this.selectedFacility$,
      this.loading$,
      (cases, selectedCase, facilities, selectedFacility, loading) => ({
        cases,
        selectedCase,
        facilities,
        selectedFacility,
        loading
      })
    );

    readonly deviceListVm$ = this.select(
      this.deviceList$,
      this.loading$,
      (deviceList, loading) =>({
        deviceList,
        loading
      })
    );

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

    readonly updateSelectedCrematorName = this.updater((state: AppState, selectedCrematorName: string) => ({
      ...state,
      selectedCrematorName
    }));

    readonly updateSelectedFacility = this.updater((state: AppState, selectedFacility: Facility) => ({
      ...state,
      selectedFacility
    }));

    readonly updateFacilities = this.updater((state: AppState, facilities: Facility[]) => ({
      ...state,
      facilities: [...facilities]
    }));

    readonly updateDeviceList = this.updater((state: AppState, deviceList: Device[]) => ({
      ...state,
      deviceList
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

    readonly updatePrimaryTemp = this.updater((state: AppState, primaryTemp: string) => ({
      ...state,
      primaryTemp
    }));

    readonly updateSecondaryTemp = this.updater((state: AppState, secondaryTemp: string) => ({
      ...state,
      secondaryTemp
    }));

    readonly updateEwonPreheat = this.updater((state: AppState, ewonPreheat: string) => ({
      ...state,
      ewonPreheat
    }));

    readonly getFacilities = this.effect(trigger$ => trigger$.pipe(
      tap(() => this.loadingService.present()),
      switchMap(() =>  this.facilitiesService.getFacilities().then(
        (response: Facility[]) => {
          this.updateFacilities(response);
          this.loadingService.dismiss();
        }))
      ));

    readonly getDeviceList = this.effect<string>(trigger$ => trigger$.pipe(
      tap(() => this.loadingService.present()),
      switchMap(async (facilityId) => this.deviceListService.getDeviceIdsByFacilityId(facilityId).then(
        (response: string[]) => {
          Promise.all(response.map(id => this.deviceListService.getDeviceNameById(id))).then((names: string[]) => {

            this.updateDeviceList(this.getSortedDeviceObjects(response, names));
          });
          this.loadingService.dismiss();
        }))
    ));

    getSortedDeviceObjects(deviceIds: string[], deviceNames: string[]) {
      const devices: Device[] = [];
      for (let i = 0; i < deviceNames.length; i++) {
        devices.push({ id: deviceIds[i], name: deviceNames[i] });
      }
      devices.sort((a, b) => (a.name < b.name ? -1 : 1));
      return devices;
    }

    readonly getCases = this.effect<string>(cases$ => cases$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((facilityId) => this.caseService.getCases().then(
        (response: Case[]) => {
          this.updateCases(response.filter((caseToFilter) => caseToFilter.facilityId === facilityId && caseToFilter.isObsolete === false));
          this.loadingService.dismiss();
        }))
    ));

    readonly createCase = this.effect<Case>(case$ => case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) => this.caseService.createCase(selectedCase).then(
        () => {
          this.getCases(selectedCase.facilityId);
          this.loadingService.dismiss();
        })),
        catchError(() => this.loadingService.dismiss())
    ));

    readonly updateCase = this.effect<Case>(case$ => case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) => this.caseService.updateCase(selectedCase.id, selectedCase).then(
        () => {
          this.getCases(selectedCase.facilityId);
          this.loadingService.dismiss();
        }))
    ));

    readonly deleteCase = this.effect<Case>(case$ => case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) => this.caseService.deleteCase(selectedCase.id.toString()).then(
        () => {
          this.getCases(selectedCase.facilityId);
          this.loadingService.dismiss();
        }))
    ));

    readonly getUserInfo = this.effect<string>(trigger$ => trigger$.pipe(
      switchMap((userId) => this.facilitiesService.getUserInfo(userId).then(
        (response: UserInfo) => {
          this.auth.token$.subscribe(async res => {
            this.facilitiesService.getAttachment(res.accessToken, response.photoId).subscribe(data => {
              response.imageBlob = data;
              this.createImageFromBlob(response);
            });
          });
        }))
    ));

    readonly getPrimaryChamberTempValues = this.effect<string>(trigger$ => trigger$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((deviceName) =>  this.cremationProcessService.getSignalId("TT100_PV", deviceName).then(
        (signalId: string) => {
          //console.log("Primary signalId: " + signalId);
          this.signalRService.initializeSignalRConnection(signalId, (measurement: Measurement) => {
            if(measurement) {
              console.log("Primary measurement value: " + measurement.value);
              this.updatePrimaryTemp(measurement.value);
            }
          });

          this.loadingService.dismiss();
        }))
      ));

      readonly getSecondaryChamberTempValues = this.effect<string>(trigger$ => trigger$.pipe(
        tap(() => this.loadingService.present()),
        switchMap((deviceName) =>  this.cremationProcessService.getSignalId("TT101_PV", deviceName).then(
          (signalId: string) => {
            //console.log("Secondary signalId: " + signalId);
            this.signalRService.initializeSignalRConnection(signalId, (measurement: Measurement) => {
              if(measurement) {
                console.log("Secondary measurement value: " + measurement.value);
                this.updateSecondaryTemp(measurement.value);
              }
            });

            this.loadingService.dismiss();
          }))
        ));

        readonly getEwonPreheatValue = this.effect<string>(trigger$ => trigger$.pipe(
          tap(() => this.loadingService.present()),
          switchMap((deviceName) =>  this.cremationProcessService.getSignalId("Ewon_Preheat", deviceName).then(
            (signalId: string) => {
              console.log("Ewon_Preheat signalId: " + signalId);
              this.signalRService.initializeSignalRConnection(signalId, (measurement: Measurement) => {
                if(measurement) {
                  console.log("Ewon_Preheat value: " + measurement.value);
                  this.updateEwonPreheat(measurement.value);
                }
              });

              this.loadingService.dismiss();
            }))
          ));

    createImageFromBlob(userInfo: UserInfo) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        userInfo.photoBase64 = reader.result.toString();
        this.updateUserInfo(userInfo);
      }, false);

      if (userInfo.imageBlob) {
         reader.readAsDataURL(userInfo.imageBlob);
      }
   }

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

    readonly openCasesModal = this.effect<string>(trigger$ => trigger$.pipe(
      mergeMap((selectedFacilityId) => this.presentCasesModal(selectedFacilityId))
    ));

    async presentCasesModal(selectedFacilityId: string) {
      const modal = await this.modalController.create({
        component: CaseListPage,
        componentProps: {
          selectedFacilityId
        }
      });
      return await modal.present();
    }
}
