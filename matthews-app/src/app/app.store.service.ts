/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore } from '@ngrx/component-store';
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
import { AuthService, ConsoleLogObserver } from 'ionic-appauth';
import { LoadingService } from './core/loading.service';
import { CremationProcessService } from './cremation-process/cremation-process.service';
import { Alarm, Measurement, SignalRService } from './core/signal-r.service';
import { Signal } from './device-list/signal';
import { FacilityStatus } from './case/facility-status.model';
import { v4 as uuidv4 } from 'uuid';

export interface AppState {
  cases: Case[];
  selectedCase: Case;
  facilities: Facility[];
  facilityStatuses: FacilityStatus[];
  loading: boolean;
  deviceList: Device[];
  alarmList: Alarm[];
  userInfo: UserInfo;
  selectedDevice: Device;
  selectedFacility: Facility;
  deviceCases: Case[];
  weeklyCaseCount: number;
  refreshCasesList: string;
  selectedCaseId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppStoreService extends ComponentStore<AppState> {
  constructor(
    private auth: AuthService,
    private caseService: CaseService,
    private facilitiesService: FacilityService,
    private deviceListService: DeviceListService,
    public modalController: ModalController,
    private loadingService: LoadingService,
    private signalRService: SignalRService
  ) {
    super({
      cases: [],
      selectedCase: {} as Case,
      facilities: [],
      facilityStatuses: [],
      loading: false,
      deviceList: [],
      alarmList: [],
      userInfo: {} as UserInfo,
      selectedDevice: {} as Device,
      selectedFacility: {} as Facility,
      deviceCases: [],
      weeklyCaseCount: 0,
      refreshCasesList: uuidv4(),
      selectedCaseId: uuidv4(),
    });
  }

  readonly cases$: Observable<Case[]> = this.select((state) => state.cases);
  readonly selectedCase$: Observable<Case> = this.select(
    (state) => state.selectedCase
  );
  readonly facilities$: Observable<Facility[]> = this.select(
    (state) => state.facilities
  );
  readonly deviceList$: Observable<Device[]> = this.select(
    (state) => state.deviceList
  );
  readonly loading$: Observable<boolean> = this.select(
    (state) => state.loading
  );
  readonly userInfo$: Observable<UserInfo> = this.select(
    (state) => state.userInfo
  );
  readonly selectedDevice$: Observable<Device> = this.select(
    (state) => state.selectedDevice
  );
  readonly selectedDeviceSignals$: Observable<Signal[]> = this.select(
    this.selectedDevice$,
    (selectedDevice) => selectedDevice.signals
  );
  readonly selectedFacility$: Observable<Facility> = this.select(
    (state) => state.selectedFacility
  );
  readonly deviceCases$: Observable<Case[]> = this.select(
    (state) => state.deviceCases
  );

  readonly weeklyCaseCount$: Observable<number> = this.select(
    (state) => state.weeklyCaseCount
  );

  readonly facilityStatuses$: Observable<FacilityStatus[]> = this.select(
    (state) => state.facilityStatuses
  );

  readonly refreshCasesList$: Observable<string> = this.select(
    (state) => state.refreshCasesList
  )

  readonly selectedCaseId$: Observable<string> = this.select(
    (state) => state.selectedCaseId
  )

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
      loading,
    })
  );

  readonly deviceListVm$ = this.select(
    this.deviceList$,
    this.selectedDevice$,
    this.loading$,
    (deviceList, selectedDevice, loading) => ({
      deviceList,
      selectedDevice,
      loading,
    })
  );

  readonly vm$ = this.select(
    this.cases$,
    this.facilities$,
    this.loading$,
    (cases, facilities, loading) => ({
      cases,
      facilities,
      loading,
    })
  );

  readonly updateRefreshCasesList = this.updater(
    (state: AppState, refreshCasesList: string) => ({
      ...state,
      refreshCasesList
    })
  );

  readonly updateSelectedCaseId = this.updater(
    (state: AppState, selectedCaseId: string) => ({
      ...state,
      selectedCaseId
    })
  );  

  readonly updateFacilityStatuses = this.updater(
    (state: AppState, facilityStatuses: FacilityStatus[]) => ({
      ...state,
      facilityStatuses,
    })
  );


  readonly updateSelectedDevice = this.updater(
    (state: AppState, selectedDeviceId: string) => ({
      ...state,
      selectedDevice: state.deviceList.find(
        (device) => device.id === selectedDeviceId
      ),
    })
  );

  readonly updateSelectedFacility = this.updater(
    (state: AppState, selectedFacility: Facility) => ({
      ...state,
      selectedFacility,
    })
  );

  readonly updateFacilities = this.updater(
    (state: AppState, facilities: Facility[]) => ({
      ...state,
      facilities: [...facilities],
    })
  );

  readonly updateDeviceList = this.updater(
    (state: AppState, deviceList: Device[]) => ({
      ...state,
      deviceList,
    })
  );

  readonly updateDeviceSignals = this.updater(
    (state: AppState, deviceSignalsMap: [string, Signal[]]) => ({
      ...state,
      deviceList: this.getUpdatedSignalsForDevice(
        state.deviceList,
        deviceSignalsMap
      ),
    })
  );

  readonly updateCases = this.updater((state: AppState, cases: Case[]) => ({
    ...state,
    cases: [...cases],
  }));

  readonly updateCasesByDeviceId = this.updater(
    (state: AppState, cases: Case[]) => ({
      ...state,
      deviceCases: this.filterCasesByDevice(cases, state.selectedDevice),
    })
  );

  readonly updateAddCaseFromProcess = this.updater(
    (state: AppState, fromProcess: boolean) => ({
      ...state,
      addCaseFromProcess: fromProcess,
    })
  );

  filterCasesByDevice(cases: Case[], selectedDevice: Device): Case[] {
    console.log(cases);
    //return cases.filter(x => (x.scheduledDevice === selectedDevice.id || !x.scheduledDevice) && x.status === '1');
    return cases;
  }

  readonly updateSelectedCase = this.updater(
    (state: AppState, selectedCase: Case) => ({
      ...state,
      selectedCase,
    })
  );

  readonly updateUserInfo = this.updater(
    (state: AppState, userInfo: UserInfo) => ({
      ...state,
      userInfo,
    })
  );

  readonly updateLoading = this.updater(
    (state: AppState, loading: boolean) => ({
      ...state,
      loading,
    })
  );

  readonly updateInitSignalsMeasurements = this.updater(
    (state: AppState, signalsMeasurement: Measurement[]) => ({
      ...state,
      signalsMeasurement,
    })
  );

  readonly updateDevicesStatusSignals = this.updater(
    (state: AppState, deviceList: Device[]) => ({
      ...state,
      deviceList,
    })
  );

  readonly updateAlarmEventFromSignalR = this.updater(
    (state: AppState, alarm: Alarm) => {
      const stateCopy = JSON.parse(JSON.stringify(state)) as AppState;

      stateCopy.alarmList.push(alarm);

      return {
        ...state,
        alarmList: stateCopy.alarmList
      };
    }
  );

  getDefaultRefreshCasesList(): string {
    return uuidv4();
  }

  readonly updateSignalWithValueFromSingalR = this.updater(
    (state: AppState, measurement: Measurement) => {
      const stateCopy = JSON.parse(JSON.stringify(state)) as AppState;

      stateCopy.deviceList.forEach((device) => {
        const signal = device.signals.find(
          (s) => s.id === measurement.signalId
        );
        // eslint-disable-next-line eqeqeq
        if (signal?.value || signal?.value == '0') {
          signal.value = measurement.value;
        }
      });

      if (stateCopy.selectedDevice && stateCopy.selectedDevice.id) {
        const selectedDeviceSignal = stateCopy.selectedDevice.signals.find(
          (s) => s.id === measurement.signalId
        );
        // eslint-disable-next-line eqeqeq
        if (selectedDeviceSignal?.value || selectedDeviceSignal?.value == '0') {
          selectedDeviceSignal.value = measurement.value;
        }
      }

      return {
        ...state,
        selectedDevice: stateCopy.selectedDevice,
        deviceList: stateCopy.deviceList,
      };
    }
  );

  readonly refreshCaseList = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this.loadingService.present();
        this.updateRefreshCasesList(uuidv4());
        this.loadingService.dismiss();
      })
    )
  );

  readonly getFacilities = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => this.loadingService.present()),
      switchMap(() =>
        this.facilitiesService.getFacilities().then((response: Facility[]) => {
          this.updateFacilities(response);
          this.loadingService.dismiss();
        })
      )
    )
  );

  readonly getDeviceList = this.effect<string>((devices$) =>
    devices$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((facilityId) =>
        this.deviceListService
          .getDevices(facilityId)
          .then((devices: Device[]) => {
            this.updateDeviceList(devices);
            this.loadingService.dismiss();
          })
      )
    )
  );

  readonly getDeviceListWithSignalR = this.effect<string>((trigger$) =>
    trigger$.pipe(
      //tap(() => this.loadingService.present()),
      switchMap((facilityId) =>
        this.deviceListService
          .getDevices(facilityId)
          .then((devices: Device[]) => {
            this.updateDeviceList(devices);
            this.addMeasurementListener();
            this.addEventListener();
            devices.forEach((device) => {
              this.deviceListService
                .getSignalsForDevice(device.id)
                .then((signals) => {
                  this.signalRService.proxyMeasurement
                    .invoke(
                      'SubscribeAll',
                      signals.map((x) => x.id)
                    )
                    .done((measurements) => {
                      measurements.forEach((measurement) => {
                        signals.find(
                          (signal) => signal.id === measurement.signalId
                        ).value = measurement.value;
                      });
                      const deviceSignalsMap: [string, Signal[]] = [
                        device.id,
                        signals,
                      ];
                      this.updateDeviceSignals(deviceSignalsMap);
                    });
                });
            });

            this.loadingService.dismiss();
          })
      )
    )
  );

  addMeasurementListener() {
    this.signalRService.addListenerMeasurement((measurement: Measurement) => {
      this.updateSignalWithValueFromSingalR(measurement);
      // devices.forEach(device => {
      //     if(device.signals.find(signal => signal.id === measurement.signalId)?.value)
      //     {
      //       device.signals.find(signal => signal.id === measurement.signalId).value = measurement.value ;
      //       const deviceSignalsMap: [string, Signal[]] = [device.id, device.signals];
      //       this.updateDeviceSignals(deviceSignalsMap);
      //     }
      // });
    });
  }

  addEventListener() {
    this.signalRService.addListenerEvent((alarm: Alarm) => {
      this.updateAlarmEventFromSignalR(alarm);
    });
  }

  readonly refreshSelectedCaseId = this.effect<string>((trigger$) =>
    trigger$.pipe(
      tap((newCaseId: string) => {
        this.loadingService.present();
        this.updateSelectedCaseId(newCaseId);
        this.loadingService.dismiss();
      })
    )
  );  

  readonly getCases = this.effect<string>((cases$) =>
    cases$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((facilityId) =>
        this.caseService.getCases(facilityId).then((response: Case[]) => {
          this.updateCases(
            response.filter(
              (caseToFilter) =>
                caseToFilter.scheduledFacility === facilityId &&
                caseToFilter.isObsolete === false
            )
          );
          this.loadingService.dismiss();
        })
      )
    )
  );

  readonly getCasesByDay = this.effect<[string, Date]>((cases$) =>
    cases$.pipe(
      tap(() => this.loadingService.present()),
      switchMap(([facilityId, date]) =>
        this.caseService.getScheduledCasesByDay(facilityId, date).then((cases) => {
          // Update cases based on filter criteria
          this.updateCases(
            cases.filter(
              (caseToFilter) =>
                caseToFilter.scheduledFacility === facilityId &&
                caseToFilter.isObsolete === false
            )
          );
          //this.loadingService.dismiss();
        })
      ),
      tap(() => this.loadingService.dismiss())
    )
  );

  readonly getCasesByWeek = this.effect<[string, Date]>((cases$) =>
    cases$.pipe(
      tap(() => this.loadingService.present()),
      switchMap(([facilityId, date]) => {
        if (!facilityId) return;
        return this.caseService.getScheduledCasesByWeek(facilityId, date).then((response: Case[]) => {
          const filteredCases = response.filter(
            (caseToFilter) =>
              caseToFilter.scheduledFacility === facilityId &&
              caseToFilter.isObsolete === false
          );
          this.updateCases(filteredCases);
          this.patchState({ weeklyCaseCount: filteredCases.length }); // Update the count in state
          //this.loadingService.dismiss();
        });
      }),
      tap(() => this.loadingService.dismiss())
    )
  );

  readonly getUnscheduledCases = this.effect((cases$) =>
    cases$.pipe(
      tap(() => this.loadingService.present()),
      switchMap(() =>
        this.caseService.getUnscheduledCases().then((cases) => {
          this.updateCases(
            cases.filter(
              (caseToFilter) =>
                caseToFilter.isObsolete === false
            )
          );
          this.loadingService.dismiss();
        })
      )
    )
  );

  readonly getCasesForDevice = this.effect<string>((cases$) =>
    cases$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((deviceId) =>
        this.caseService
          .getReadyCasesByDevice(deviceId)
          .then((response: Case[]) => {
            // eslint-disable-next-line max-len
            this.updateCasesByDeviceId(response);
            this.loadingService.dismiss();
          })
      )
    )
  );

  readonly createCase = this.effect<Case>((case$) =>
    case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) =>
        this.caseService.createCase(selectedCase).then((savedCase) => {
          this.getCases(selectedCase.scheduledFacility);
          this.loadingService.dismiss();
        })
      ),
      catchError(() => this.loadingService.dismiss())
    )
  );

  readonly createCaseFromProcess = this.effect<Case>((case$) =>
    case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) =>
        this.caseService.createCase(selectedCase).then((savedCase) => {
          this.getCases(selectedCase.scheduledFacility);
          this.updateSelectedCase(savedCase);
          this.loadingService.dismiss();
        })
      ),
      catchError(() => this.loadingService.dismiss())
    )
  );

  readonly updateCase = this.effect<Case>((case$) =>
    case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) =>
        this.caseService.updateCase(selectedCase.id, selectedCase).then(() => {
          this.getCases(selectedCase.scheduledFacility);
          this.loadingService.dismiss();
        })
      )
    )
  );

  readonly deleteCase = this.effect<Case>((case$) =>
    case$.pipe(
      tap(() => this.loadingService.present()),
      switchMap((selectedCase) =>
        this.caseService.deleteCase(selectedCase.id.toString()).then(() => {
          this.getCases(selectedCase.scheduledFacility);
          this.loadingService.dismiss();
        })
      )
    )
  );

  readonly getUserInfo = this.effect<string>((trigger$) =>
    trigger$.pipe(
      switchMap((userId) =>
        this.facilitiesService
          .getUserInfo(userId)
          .then((response: UserInfo) => {
            this.auth.token$.subscribe(async (res) => {
              if (response.photoId !== null) {
                this.facilitiesService
                  .getAttachment(res.accessToken, response.photoId)
                  .subscribe((data) => {
                    response.imageBlob = data;
                    this.createImageFromBlob(response);
                  });
              }
            });
          })
      )
    )
  );

  createImageFromBlob(userInfo: UserInfo) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        userInfo.photoBase64 = reader.result.toString();
        this.updateUserInfo(userInfo);
      },
      false
    );

    if (userInfo.imageBlob) {
      reader.readAsDataURL(userInfo.imageBlob);
    }
  }

  readonly openCaseModal = this.effect<Case>((trigger$) =>
    trigger$.pipe(mergeMap((selectedCase) => this.presentModal(selectedCase)))
  );

  readonly openCaseModalFromProcess = this.effect<Case>((trigger$) =>
    trigger$.pipe(
      mergeMap((selectedCase) => this.presentModalFromProcess(selectedCase))
    )
  );

  async presentModal(selectedCase: Case) {
    const modal = await this.modalController.create({
      component: CasePage,
      componentProps: {
        selectedCase,
      },
    });
    return await modal.present();
  }

  async presentModalFromProcess(selectedCase: Case) {
    const modal = await this.modalController.create({
      component: CasePage,
      componentProps: {
        selectedCase,
        fromProcess: true,
      },
    });
    return await modal.present();
  }

  readonly openCasesModal = this.effect<string>((trigger$) =>
    trigger$.pipe(mergeMap((deviceId) => this.presentCasesModal(deviceId)))
  );

  async presentCasesModal(selectedDeviceId: string) {
    const modal = await this.modalController.create({
      component: CaseListPage,
      componentProps: {
        selectedDeviceId,
      },
    });
    return await modal.present();
  }

  getUpdatedSignalsForDevice(
    deviceList: Device[],
    deviceSignalsMap: [string, Signal[]]
  ) {
    deviceList.find((x) => x.id === deviceSignalsMap[0]).signals =
      deviceSignalsMap[1];
    return deviceList;
  }
}
