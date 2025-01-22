/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  AlertOptions,
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
import { Observable, of, Subscription } from 'rxjs';
import { BurnMode, ChamberStatus } from '../core/enums';
import {
  ContainerTypeSelection,
  GenderSelection,
} from '../case/selection-option';
import { distinctUntilChanged, filter, find, map, skip, switchMap, tap } from 'rxjs/operators';
import { CaseService } from '../case/case.service';
import { Signal } from '../device-list/signal';
import { SignalRCaseApiService } from '../core/signal-r.case-api.service';

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
          const endTimeEstimate = Math.floor(parseFloat(signal.value)); // Ensure it's a valid integer
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          const remainingSeconds = endTimeEstimate - currentTime;
  
          // Calculate remaining time in minutes and seconds
          if (remainingSeconds > 0) {
            const minutes = Math.floor(remainingSeconds / 60);
            this.remainingTime = `${minutes}m`;
          } else {
            this.remainingTime = '0m'; // Default if time has passed
          }
        }
        if (
          signal.name === 'MACHINE_STATUS' &&
          (parseInt(signal.value) >= 40 &&
            parseInt(signal.value) < 50) ||
          parseInt(signal.value) == 4
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
            this.startCremationTimer();
          } else if (status !== 90 && status !== 95 && this.isCremationRunning) {
            // Stop the timer if status is not 90 or 95
            this.pauseTimer(); // Stop the timer
            this.cremationTime = 0; // Reset the timer value
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
  cremationTime: number;
  remainingTime: string;
  preheatTime: number;
  cooldownTime: number;
  rakeOutTime: number;
  interval;
  preheatInterval;
  cooldownInterval;
  stepNumber: number;
  case: Case;
  clientCaseId: any;
  signalTt100: string;
  signalTt101: string;
  selectedCaseId: string | null = null;
  private subscription: Subscription;

  isContinueClicked: boolean = false;

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

  constructor(
    private appStore: AppStoreService,
    private popoverController: PopoverController,
    private translateService: TranslateService,
    private matStepperIntl: MatStepperIntl,
    private route: ActivatedRoute,
    private cremationProcessService: CremationProcessService,
    public alertController: AlertController,
    private caseService: CaseService,
    private signalRCaseApiService: SignalRCaseApiService
  ) { }

  ngOnDestroy(): void {
    this.signalRCaseApiService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.appStore.updateSelectedCase(null);
    this.appStore.updateSelectedCaseId('');
  }

  ngOnInit() {
    this.matStepperIntl.optionalLabel = '';
    this.matStepperIntl.changes.next();
    this.deviceId = this.route.snapshot.paramMap.get('id');
    this.cremationTime = 0;
    this.stepNumber = 0;
    this.case = new Case();
    this.selectedCase$.pipe(skip(1)).subscribe((res) => {
      if (res !== undefined && res!== null) {
        this.matStepperIntl.optionalLabel =
          res.firstName + ' ' + res.lastName + ' - ' + res.clientCaseId;
        this.matStepperIntl.changes.next();
        this.mapCase(res);
      }
    });

    this.establishSignalRConnection();

    // this.appStore.selectedCaseId$.pipe(
    //   distinctUntilChanged(), // Ensures we only react to changes in the ID
    //   filter(caseId => !!caseId), // Ensures caseId is defined
    //   switchMap(caseId => this.caseService.getCase(caseId))
    // ).subscribe(caseData => {
    //   this.appStore.updateSelectedCase(caseData);
    // });
    this.subscription = this.appStore.selectedCaseId$
      .pipe(skip(1))
      .pipe(
        //distinctUntilChanged(), // Ensures we only react to changes in the ID
        filter(caseId => caseId !== null && caseId !== undefined), // Ensures caseId is defined
        switchMap(caseId => {
          this.selectedCaseId = caseId!;
          if(this.selectedCaseId !== "") {
          return this.caseService.getCase(caseId);
          } else {
            this.isCaseSelected = false;
            return of(null);
          }
        })
      )
      .subscribe(caseData => {
        this.appStore.updateSelectedCase(caseData);
      });


      this.caseService.getSelectedCaseByDevice(this.deviceId)
      .then(caseData => {
        const caseId = caseData?.id;

        if (caseId) {
          this.appStore.updateSelectedCaseId(caseId);
          this.appStore.updateSelectedCase(caseData);
        }
      });

    
  }

  establishSignalRConnection() {
    this.signalRCaseApiService.initializeSignalRCaseApiConnection();
    this.signalRCaseApiService.addSelectedCaseListener();
  }

  pressContinue() {
    this.isContinueClicked = true;
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
    this.startCremationTimer();
  }

  startCremationTimer() {
    this.interval = setInterval(() => {
      if (this.cremationTime >= 0) {
        this.cremationTime++;
      }
    }, 60000);
  }

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

  changeCase(facilityId: string) {
    this.presentCasesModal(facilityId);
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
            this.startCremationTimer();
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
            this.cremationTime = 0;
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

  handleSelectButtonClick(selectedDevice: Device) {
    this.pressContinue(); // Ensures button is disabled or hidden immediately
    this.move(2);
    this.caseRequest(selectedDevice);
    this.selectCaseAPI();
  }

  caseRequestFalse(selectedDevice: Device) {
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'CASE_REQUEST'
    );
    this.cremationProcessService.writeSignalValue(signal?.id, 0);
    this.caseRequired(selectedDevice);
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

  systemRestart(selectedDevice: Device) {
    const alertOptions: AlertOptions = {
      header: 'Confirm System Restart',
      message: 'Confirm System Restart',
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
              (signal) => signal.name === 'ADD_TIME'
            );
            this.cremationProcessService.writeSignalValue(signal?.id, 5);
            this.stepNumber = 2;
            this.resetIntervals();
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  segmentChanged(ev: any, selectedDevice: Device) {
    this.selectedBurnMode = ev.detail.value;
    console.log('Segment changed', ev);
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'BURN_MODE'
    );
    //console.log('Signal ID: ' + signal?.id);
    this.cremationProcessService.writeSignalValue(signal?.id, ev.detail.value);
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
        this.appStore.updateSelectedCase(nextCase);
        this.appStore.updateSelectedCaseId(nextCase.id);
      })

  }

  selectCaseFromId(caseId: string) {
    if ((caseId !== undefined && null) && caseId.length > 1) {
      this.caseService.getCase(caseId)
        .then((selCase) => this.appStore.updateSelectedCase(selCase));
    } else {
      return;
    }
  }

  presentCasesModal(deviceId: string) {
    this.appStore.openCasesModal(deviceId);
  }

  clearSelectedCase() {
    this.isCaseSelected = false;
    this.isContinueClicked = false;

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
      this.case.scheduledStartTime = res.scheduledStartTime;
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
