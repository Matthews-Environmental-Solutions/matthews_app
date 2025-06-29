/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prefer-const */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  AlertOptions,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { MatStepper, MatStepperIntl } from '@angular/material/stepper';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';
import { ExtendCyclePage } from '../extend-cycle/extend-cycle.page';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Device } from '../device-list/device';
import { CremationProcessService } from './cremation-process.service';
import { from, Observable, of, Subscription } from 'rxjs';
import { BurnMode, ChamberStatus } from '../core/enums';
import {
  ContainerTypeSelection,
  GenderSelection,
} from '../case/selection-option';
import { debounceTime, distinctUntilChanged, filter, find, map, skip, switchMap, tap } from 'rxjs/operators';
import { CaseService } from '../case/case.service';
import { Signal } from '../device-list/signal';
import { SignalRCaseApiService } from '../core/signal-r.case-api.service';
import { CaseListPage } from '../case-list/case-list.page';

@Component({
  selector: 'app-device-details',
  templateUrl: './cremation-process.page.html',
  styleUrls: ['./cremation-process.page.scss'],
})
export class CremationProcessPage implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  selectedCase$ = this.appStore.selectedCase$;
  selectedDevice$ = this.appStore.selectedDevice$.pipe(
    tap((selectedDevice) => {
      if (!selectedDevice?.signals) {
        return;
      }
      selectedDevice.signals.forEach((signal) => {
        if (signal.name === 'TT100_PV') {
          this.signalTt100 = this.convertToFahrenheit(signal.value);
        }
        if (signal.name === 'TT101_PV') {
          this.signalTt101 = this.convertToFahrenheit(signal.value);
        }
        if (signal.name === 'LOADED_ID') {
          this.selectCaseFromId(signal.value);
        }
        if (signal.name === 'BURN_MODE') {
          this.selectedBurnMode = parseInt(signal.value, 10);
        }
        if (signal.name === 'END_TIME_ESTIMATE') {
          if (signal.value !== null && signal.value !== undefined) {
            // Ensure the value is a string before using .replace()
            const sanitizedValue = String(signal.value).replace(/,/g, '');
            const endTimeEstimate = !isNaN(parseFloat(sanitizedValue))
              ? Math.floor(parseFloat(sanitizedValue))
              : null;

            if (endTimeEstimate !== null) {
              // Start the countdown timer
              this.startCountdown(endTimeEstimate);
            } else {
              console.error('Invalid endTimeEstimate after parsing:', signal.value);
            }
          } else {
            console.warn('Signal value is null or undefined for END_TIME_ESTIMATE');
          }
        }
        if (signal.name === 'START_TIME_REFERENCE') {
          if (signal.value !== null && signal.value !== undefined) {
            const sanitizedValue = String(signal.value).replace(/,/g, '');
            const startTimeEstimate = !isNaN(parseFloat(sanitizedValue))
              ? Math.floor(parseFloat(sanitizedValue))
              : null;
        
            if (startTimeEstimate !== null) {
              this.handleStartTimeEstimate(startTimeEstimate);
            } else {
              console.error('Invalid startTimeEstimate after parsing:', signal.value);
            }
          } else {
            console.warn('Signal value is null or undefined for START_TIME_ESTIMATE');
          }
        }
        
        if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) >= 40 &&
          parseInt(signal.value) < 50
        ) {
          this.move(1);
        } else if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) >= 50 &&
          parseInt(signal.value) <= 100 &&
          !this.isCremationStopped
        ) {
          this.move(2);
        } else if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) >= 110
        ) {
          this.move(3);
          //this.isCaseSelected = false;
        } else if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) < 40
        ) {
          this.move(0);
        }

        //timer handling 
        if (signal.name === 'MACHINE_STATUS') {
          const status = parseInt(signal.value, 10);
          if (status === 90 && !this.isCremationRunning) {
            // Automatically start the timer if status is 90
            this.isCremationRunning = true;
            this.setStartTime();
          } else if (status === 95 && this.isCremationRunning) {
            // Automatically pause the timer if status is 95
            this.isCyclePaused = true;
            this.pauseTimer();
          } else if (status === 90 && this.isCyclePaused) {
            // Automatically resume the timer if status goes back to 90
            this.isCyclePaused = false;
          } else if (status !== 90 && status !== 95 && this.isCremationRunning) {
            // Stop the timer if status is not 90 or 95
            this.pauseTimer(); // Stop the timer
            //this.cremationTime = 0; // Reset the timer value
            this.isCremationRunning = false;
            this.isCyclePaused = false;
          }
        }
      });
    })
  );

  selectedFacility$ = this.appStore.selectedFacility$;
  deviceList$ = this.appStore.deviceList$;
  isPreheatStarted = false;
  isCaseSelected = false;
  isCycleStarted = false;
  isCyclePaused = false;
  isCycleStopped = false;
  isCoolDownStarted = false;
  isRakeOutStarted = false;
  isRakeOutCompleted = false;
  isCremationStopped = false;
  isCremationRunning = false;
  showSearchbar: boolean;
  searchTerm: string;
  deviceId: string;
  selectedBurnMode: number;
  chamberStatus = ChamberStatus;
  startHour: number;
  startMinute: number;
  startTime: string;
  cremationTime: string = '0';
  remainingTime: string = '0';
  private timerInterval: any;
  preheatTime: number;
  cooldownTime: number;
  rakeOutTime: number;
  interval;
  cremationInterval;
  preheatInterval;
  cooldownInterval;
  stepNumber: number;
  case: Case;
  clientCaseId: any;
  signalTt100: string;
  signalTt101: string;
  selectedCaseId: string | null = null;
  private subscription: Subscription;
  private isUpdatingElapsedTime = false;
  isContinueClicked: boolean = false;
  burnModeSegmentDisabled = false;
  //testing

  containerTypes: ContainerTypeSelection[] = [
    { id: 0, name: 'None' },
    { id: 1, name: 'Cardboard' },
    { id: 2, name: 'Hardwood' },
    { id: 3, name: 'MDF Particle board' },
    { id: 4, name: 'Bag/Shroud' },
    { id: 4, name: 'Other' },
  ];
  genders: GenderSelection[] = [
    { id: 0, name: 'Male' },
    { id: 1, name: 'Female' },
    { id: 2, name: 'Other' },
  ];
  burnMode = BurnMode;
  burnModeKeys = Object.keys(BurnMode).filter((x) => parseInt(x, 10) >= 0);
  actualStartTimeSubscription: Subscription;
  selectedCaseSubcription: Subscription;

  constructor(
    private appStore: AppStoreService,
    private popoverController: PopoverController,
    private translateService: TranslateService,
    private matStepperIntl: MatStepperIntl,
    private route: ActivatedRoute,
    private cremationProcessService: CremationProcessService,
    public alertController: AlertController,
    private caseService: CaseService,
    private signalRCaseApiService: SignalRCaseApiService,
    public modalController: ModalController,
  ) { }

  ngOnDestroy(): void {
    this.signalRCaseApiService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actualStartTimeSubscription) {
      this.actualStartTimeSubscription.unsubscribe();
    }

    // if (this.selectedCaseSubcription) {
    //   this.actualStartTimeSubscription.unsubscribe();
    // }
    this.appStore.updateSelectedCase(null);
    this.appStore.updateSelectedCaseId('');
    clearInterval(this.interval);
    clearInterval(this.cremationInterval);
  }

  ngOnInit() {
    console.log('CremationProcessPage ngOnInit called!');

    this.matStepperIntl.changes.next();
    this.deviceId = this.route.snapshot.paramMap.get('id');
    //this.cremationTime = 0;
    this.stepNumber = 0;
    this.case = new Case();

    this.selectedCaseSubcription = this.selectedCase$
      .pipe(
        skip(1), // Skip the initial emission (if any)
        distinctUntilChanged((prev, curr) => {
          // Compare based on a unique identifier (e.g., `id`)
          return prev?.id === curr?.id;
        }),
        tap((res) => console.log('selectedCase$ emitted:', res)) // Log each emission
      )
      .subscribe((res) => {
        if (res !== undefined && res !== null) {
          this.matStepperIntl.optionalLabel =
            res.firstName + ' ' + res.lastName + ' - ' + res.clientCaseId;
          this.matStepperIntl.changes.next();
          this.mapCase(res);
          
          // if (res.actualStartTime) {
          //   //debugger
          //   this.updateElapsedTime(res.actualStartTime);
          //   this.appStore.updateActualStartTime(res.actualStartTime);
          // }
        }
      });

    // this.subscribeToActualStartTime();
    this.establishSignalRConnection();

    // this.appStore.selectedCaseId$.pipe(
    //   distinctUntilChanged(), // Ensures we only react to changes in the ID
    //   filter(caseId => !!caseId), // Ensures caseId is defined
    //   switchMap(caseId => this.caseService.getCase(caseId))
    // ).subscribe(caseData => {
    //   this.appStore.updateSelectedCase(caseData);
    // });
    this.subscription = this.appStore.selectedCaseId$
      .pipe(
        skip(1),
        filter(caseId => caseId !== null && caseId !== undefined),
        switchMap(caseId => {
          this.selectedCaseId = caseId!;
          if (this.selectedCaseId !== "") {
            return from(this.caseService.getCase(caseId)).pipe(
              map(caseFromServer => {
                if (caseFromServer.scheduledStartTime) {
                  const date = new Date(caseFromServer.scheduledStartTime);
                  caseFromServer.scheduledStartTime = date.toLocaleString(); // Convert to local Date object
                }
                return caseFromServer;
              })
            );
          } else {
            this.isCaseSelected = false;
            return of(null);
          }
        })
      )
      .subscribe(caseData => {
        this.appStore.updateSelectedCase(caseData);
      });

    this.caseService.GetSelectCaseByDevice(this.deviceId)
      .then(caseData => {
        const caseId = caseData?.id;

        if (caseId) {
          this.appStore.updateSelectedCaseId(caseId);
          this.appStore.updateSelectedCase(caseData);
        }
      });

  }


  // private handleStartTimeEstimate(startTimeEstimate: number) {
  //   const now = Date.now();
  //   const elapsedMs = now - startTimeEstimate;
  //   const elapsedMinutes = Math.floor(elapsedMs / 60000);
  //   const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
  
  //   this.cremationTime = elapsedMinutes;
  
  //   if (this.isCremationRunning) {
  //     this.startElapsedTimer(elapsedSeconds);
  //   }
  // }
  

  // private subscribeToActualStartTime() {
  //   this.actualStartTimeSubscription = this.appStore.actualStartTime$
  //   .pipe(skip(1))
  //     .pipe(
  //       distinctUntilChanged(),
  //       debounceTime(100) // Prevents redundant calls when actualStartTime doesn't change
  //     )
  //     .subscribe((actualStartTime) => {
  //       if (actualStartTime) {
  //         this.updateElapsedTime(actualStartTime);
  //       }
  //     });
  // }

  // private updateElapsedTime(actualStartTimeStr: string) {

  //   const actualStartTime = new Date(
  //     /[zZ]|[+-]\d{2}:\d{2}$/.test(actualStartTimeStr)
  //       ? actualStartTimeStr
  //       : actualStartTimeStr + "Z"
  //   );

  //   if (isNaN(actualStartTime.getTime())) {
  //     console.error("Invalid actualStartTime:", actualStartTimeStr);
  //     return;
  //   }

  //   const now = new Date();
  //   const elapsedMs = now.getTime() - actualStartTime.getTime();
  //   const elapsedMinutes = Math.floor(elapsedMs / 60000); // Whole minutes
  //   const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000); // Remaining seconds

  //   // Update cremationTime immediately with minute and fraction for seconds
  //   this.cremationTime = elapsedMinutes;

  //   if (this.isCremationRunning) {
  //     this.startElapsedTimer(elapsedSeconds);
  //   }
  // }

  // private startElapsedTimer(initialElapsedSec: number) {

  //   if (this.cremationInterval) {
  //     clearInterval(this.cremationInterval);
  //   }

  //   const remainingSec = 60 - initialElapsedSec;
  //   console.log("remainingMs: ", remainingSec);

  //   setTimeout(() => {
  //     this.cremationInterval = setInterval(() => {
  //       this.cremationTime++;
  //     }, 60000);
  //   }, remainingSec * 1000); // 👈 This is the fix
    
  // }


  startCountdown(endTimeEstimate: number) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const currentTime = Math.floor(new Date().getTime() / 1000);
      const remainingSeconds = endTimeEstimate - currentTime;

      if (remainingSeconds > 0) {
        this.remainingTime = Math.floor(remainingSeconds / 60).toString();
      } else {
        this.remainingTime = '0';
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  handleStartTimeEstimate(startTimeEstimate: number) {
    if (this.cremationInterval) {
      clearInterval(this.cremationInterval);
    }
  
    this.cremationInterval = setInterval(() => {
      const currentTime = Math.floor(new Date().getTime() / 1000); // current time in seconds
      const elapsedSeconds = currentTime - startTimeEstimate;
  
      if (elapsedSeconds >= 0) {
        this.cremationTime = Math.floor(elapsedSeconds / 60).toString(); // in minutes
      } else {
        this.cremationTime = '0';
        console.warn('Start time is in the future — elapsed time cannot be negative.');
        clearInterval(this.cremationInterval);
      }
    }, 1000);
  }


  establishSignalRConnection() {
    this.signalRCaseApiService.initializeSignalRCaseApiConnection();
    this.signalRCaseApiService.addSelectedCaseListener();
  }

  parseSignalValue(value: string): number {
    return parseInt(value);
  }

  convertToFahrenheit(temp: string): string {
    // Convert the input string to a number
    const celsius = parseFloat(temp);

    // Check if the input was a valid number
    if (isNaN(celsius)) {
      return "Invalid input";  // Return an error message if not a valid number
    }

    // Convert Celsius to Fahrenheit
    const fahrenheit = (celsius * 9 / 5) + 32;

    // Return the result as a string
    return fahrenheit.toFixed(0);  // Formats the result to 0 decimal places
  }

  setStartTime() {
    const currentDate = new Date();
    this.startHour = currentDate.getHours();
    this.startMinute = currentDate.getMinutes();
    if (this.startMinute > 9) {
      this.startTime =
        this.startHour.toString() + ':' + this.startMinute.toString();
    } else {
      this.startTime =
        this.startHour.toString() + ':' + '0' + this.startMinute.toString();
    }
    // this.startCremationTimer();
  }

  // startCremationTimer() {
  //   this.interval = setInterval(() => {
  //     if (this.cremationTime >= 0) {
  //       this.cremationTime++;
  //     }
  //   }, 60000);
  // }

  startCooldownTimer() {
    this.cooldownTime = 100;
    this.cooldownInterval = setInterval(() => {
      if (this.cooldownTime > 0) {
        this.cooldownTime--;
      }
    }, 1000);
  }

  startPreheatTimer() {
    this.preheatTime = 100;
    this.preheatInterval = setInterval(() => {
      if (this.preheatTime > 0) {
        this.preheatTime--;
      }
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  resetIntervals() {
    clearInterval(this.interval);
    clearInterval(this.preheatInterval);
    clearInterval(this.cooldownInterval);
  }

  startPreheat(selectedDevice: Device) {
    this.isPreheatStarted = true;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'PREHEAT'
    );
    console.log('SignalId' + signal.id);
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
    this.startPreheatTimer();
  }

  stopPreheat(selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmPreheatStop'),
      message: this.translateService.instant('ConfirmPreheatStopMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.isPreheatStarted = false;
            const signal = selectedDevice.signals.find(
              (signal) => signal.name === 'PREHEAT'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 0);
            this.preheatTime = 0;
            this.move(1);
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  trackItems(index: number, itemObject: any) {
    return itemObject.id;
  }

  selectCase() {
    this.isCaseSelected = true;
  }

  startCycle(selectedDevice: Device) {
    this.isCycleStarted = true;

    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'START_CREMATION'
    );
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
    this.setStartTime();
  }

  pauseCycle(selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmPauseCycle'),
      message: this.translateService.instant('ConfirmPauseCycleMessage'),
      buttons: [
        {
          text: this.translateService.instant('No'),
          role: 'no',
        },
        {
          text: this.translateService.instant('Yes'),
          role: 'yes',
          handler: () => {
            this.isCyclePaused = true;
            const signal = selectedDevice.signals.find(
              (signal) => signal.name === 'PAUSE_CREMATION'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 1);
            this.pauseTimer();
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  resumeCycle(selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmResumeCycle'),
      message: this.translateService.instant('ConfirmResumeCycleMessage'),
      buttons: [
        {
          text: this.translateService.instant('No'),
          role: 'no',
        },
        {
          text: this.translateService.instant('Yes'),
          role: 'yes',
          handler: () => {
            this.isCyclePaused = false;
            const signal = selectedDevice.signals.find(
              (signal) => signal.name === 'PAUSE_CREMATION'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 0);
            //this.startCremationTimer();
          },
        },
      ],
    };
    this.presentAlert(alertOptions);
  }

  async presentPopover(ev: any, selectedDevice: Device) {
    const popover = await this.popoverController.create({
      component: ExtendCyclePage,
      componentProps: { selectedDevice },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();

    popover.onDidDismiss().then((data) => {
      console.log(data);
      //this.cremationTime += +data.data;
    });
  }

  endCycle(stepper: MatStepper, selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('EndCycle'),
      message: this.translateService.instant('EndCycleMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            const signal = selectedDevice.signals.find(
              (signal) => signal.name === 'STOP_CREMATION'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 1);
            this.cremationTime = '0';
            this.isCremationStopped = true;
            this.coolDown(selectedDevice);
            this.move(3);
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  skipCooldown(stepper: MatStepper, selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('SkipCooldown'),
      message: this.translateService.instant('SkipCooldownMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.coolDown(selectedDevice);
          },
        },
      ],
    };
    this.presentAlert(alertOptions);
  }

  coolDown(selectedDevice: Device) {
    this.isCoolDownStarted = true;
    this.isRakeOutStarted = false;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'COOLDOWN'
    );
    console.log('Signal ID: ' + signal?.id);
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
    this.startCooldownTimer();
  }

  rakeOut(selectedDevice: Device) {
    this.isRakeOutStarted = true;
    this.isCoolDownStarted = false;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'RAKE_OUT'
    );
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
    this.cooldownTime = 0;
  }

  caseRequestFalse(selectedDevice: Device) {
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'CASE_REQUEST'
    );
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
    this.caseRequiredEmpty(selectedDevice);
  }

  caseRequiredEmpty(selectedDevice: Device) {
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'CASE_REQUIRED'
    );

    let empty: any = '';
    this.cremationProcessService.writeSignalValue(signal?.id, empty);
  }

  caseRequest(selectedDevice: Device) {
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'CASE_REQUEST'
    );
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
    this.caseRequired(selectedDevice);
  }

  caseRequired(selectedDevice: Device) {
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'CASE_REQUIRED'
    );

    // eslint-disable-next-line prefer-const
    let signalValue = this.clientCaseId;
    console.log(signalValue);
    this.cremationProcessService.writeSignalValue(signal?.id, signalValue);
  }

  selectCaseAPI(): void {
    if (this.selectedCaseId) {
      this.caseService
        .selectCase(this.selectedCaseId)
        .then(response => console.log('Case selected successfully:', response))
        .catch(error => console.error('Error selecting case:', error));
    } else {
      console.error('No selected case ID to send');
    }
  }

  rakeOutConfirmation(stepper: MatStepper, selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmRakeOut'),
      message: this.translateService.instant('ConfirmRakeOutMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.resetStepper(stepper);
            const signal = selectedDevice.signals.find(
              (signal) => signal.name === 'RAKE_COMPLETE'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 1);
            this.stepNumber = 0;
            this.resetIntervals();
            this.clearSelectedCase();
            this.caseRequestFalse(selectedDevice);
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  systemShutdown(stepper: MatStepper, selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: 'Confirm System ShutDown',
      message: 'Confirm System ShutDown',
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.resetStepper(stepper);
            const signal = selectedDevice.signals.find(
              (signal) => signal.name === 'COOLDOWN'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 1);
            const signal1 = selectedDevice.signals.find(
              (signal1) => signal1.name === 'BURN_MODE'
            );
            this.cremationProcessService.writeSignalValue(signal1?.id, 1);
            this.stepNumber = 0;
            this.resetIntervals();
            this.isCaseSelected = false;
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  async systemRestart(ev: Event, selectedDevice: Device) {
    const popover = await this.popoverController.create({
      component: ExtendCyclePage,
      componentProps: { selectedDevice },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data && data > 0) {
      const signal = selectedDevice.signals.find(
        (signal) => signal.name === 'ADD_TIME'
      );
      this.cremationProcessService.writeSignalValue(signal?.id, data);
      this.stepNumber = 2;
      this.resetIntervals();
    }
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  segmentChanged(ev: any, selectedDevice: Device) {
    if (this.burnModeSegmentDisabled) return;
    this.burnModeSegmentDisabled = true;
    this.selectedBurnMode = ev.detail.value;
    let value: number = +ev.detail.value;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'BURN_MODE'
    );
    //console.log('Signal ID: ' + signal?.id);
    this.cremationProcessService.writeSignalValue(signal?.id, value);

    setTimeout(() => {
      this.burnModeSegmentDisabled = false;
    }, 2500);
  }

  async presentAlert(options: AlertOptions) {
    const alert = await this.alertController.create(options);
    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  resetStepper(stepper: MatStepper) {
    this.resetProperties();
    stepper.reset();
  }

  ionViewDidLeave() {
    this.resetProperties();
  }

  resetProperties() {
    this.isPreheatStarted = false;
    this.isCaseSelected = false;
    this.isContinueClicked = false;
    this.isCycleStarted = false;
    this.isCoolDownStarted = false;
    this.isRakeOutStarted = false;
    this.appStore.updateSelectedCase({} as Case);
    this.matStepperIntl.optionalLabel = '';
  }

  autoSelectNextCase(deviceId: string) {
    this.caseService
      .getNextCaseForDevice(deviceId)
      .then((nextCase) => {
        if (nextCase) {
          this.appStore.updateSelectedCase(nextCase);
          this.appStore.updateSelectedCaseId(nextCase.id);
        }
      })
      .catch((error) => {
        console.error("Error fetching next case:", error);
      });
  }

  selectCaseFromId(caseId: string) {
    if ((caseId !== undefined && null) && caseId.length > 1) {
      this.caseService.getCase(caseId)
        .then((selCase) => this.appStore.updateSelectedCase(selCase));
    } else {
      return;
    }
  }

  // presentCasesModal(deviceId: string) {
  //   this.appStore.openCasesModal(deviceId);
  // }

  async presentCasesModal(selectedDeviceId: string) {
    const modal = await this.modalController.create({
      component: CaseListPage,
      componentProps: {
        selectedDeviceId,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.selectedCase) {
      this.selectCaseAPI();
    }
  }

  clearSelectedCase() {
    this.isCaseSelected = false;
    this.isContinueClicked = false;
    this.cremationTime = '0';
    this.caseService.deselectCase(this.selectedCaseId)
      .then((response) => console.log('Case deselected successfully:', response))
      .catch((error) => console.error('Error deselecting case:', error));
  }

  mapCase(res) {
    if (res !== undefined && res.id !== undefined) {
      this.case.firstName = res.firstName;
      this.case.lastName = res.lastName;
      this.case.genderText = this.genders[res.gender].name;
      this.case.weight = res.weight;
      this.case.containerTypeText = this.containerTypes[res.containerType].name;
      const rawTime = res.scheduledStartTime; // e.g., "2025-05-26T11:31:47"
      const utcTime = rawTime.endsWith('Z') ? rawTime : rawTime + 'Z';
      const date = new Date(utcTime); // now it's correctly treated as UTC

      this.case.scheduledStartTime = date.toLocaleString();
      this.clientCaseId = res.clientCaseId;
    }

    if (this.case.firstName !== undefined) {
      this.isCaseSelected = true;
    }
  }

  goToNextStep(stepper: MatStepper) {
    stepper.next();
    console.log('Stepper');
  }

  move(index: number) {
    setTimeout(() => {
      this.stepper.selectedIndex = index;
      this.stepNumber = index;
    }, 0);
  }

  moveToZero() {
    setTimeout(() => {
      this.stepper.selectedIndex = 0;
      this.stepNumber = 0;
    }, 0);
  }

  moveToFirst(machineValue: number) {
    if (machineValue >= 40) {
      setTimeout(() => {
        this.stepper.selectedIndex = 1;
        this.stepNumber = 1;
      }, 0);
    }
  }

  moveToSecond(machineValue: number) {
    if (machineValue >= 50 && machineValue <= 90) {
      setTimeout(() => {
        this.stepper.selectedIndex = 2;
        this.stepNumber = 2;
      }, 0);
    }
  }

  moveToThird(machineValue: number) {
    if (machineValue >= 100) {
      setTimeout(() => {
        this.stepper.selectedIndex = 3;
        this.stepNumber = 3;
      }, 0);
    }
  }

  logStepNumber() {
    console.log(this.stepNumber);
  }

  presentModal(selectedCase?: Case) {
    this.appStore.openCaseModal(
      selectedCase
        ? { ...selectedCase }
        : ({ scheduledDevice: this.deviceId } as Case)
    );
  }

  presentModalFromProcess(deviceId: string) {
    this.appStore.openCaseModalFromProcess(
      { scheduledDevice: deviceId } as Case
    );
  }
}
