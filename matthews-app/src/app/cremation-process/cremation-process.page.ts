/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { Observable } from 'rxjs';
import { BurnMode, ChamberStatus } from '../core/enums';
import {
  ContainerTypeSelection,
  GenderSelection,
} from '../case/selection-option';
import { skip, tap } from 'rxjs/operators';
import { CaseService } from '../case/case.service';
import { Signal } from '../device-list/signal';

@Component({
  selector: 'app-device-details',
  templateUrl: './cremation-process.page.html',
  styleUrls: ['./cremation-process.page.scss'],
})
export class CremationProcessPage implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  selectedCase$ = this.appStore.selectedCase$;
  selectedDevice$ = this.appStore.selectedDevice$.pipe(
    tap((selectedDevice) => {
      if (!selectedDevice?.signals) {
        return;
      }
      selectedDevice.signals.forEach((signal) => {
        if(signal.name === 'TT100_PV') {
          this.signalTt100 = signal.value;
        }
        if (signal.name === 'TT101_PV') {
          this.signalTt101 = signal.value;
        }
        if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) >= 40 &&
          parseInt(signal.value) < 50
          &&!this.isCaseSelected
        ) {
          this.move(1);
        } else if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) >= 50 &&
          parseInt(signal.value) < 100 &&
          !this.isCremationStopped
        ) {
          this.move(2);
        } else if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) >= 100
        ) {
          this.move(3);
          this.isCaseSelected = false;
        } else if (
          signal.name === 'MACHINE_STATUS' &&
          parseInt(signal.value) < 40
        ) {
          this.move(0);
          this.isCaseSelected = false;
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
  showSearchbar: boolean;
  searchTerm: string;
  deviceId: string;
  selectedBurnMode: number;
  chamberStatus = ChamberStatus;
  startHour: number;
  startMinute: number;
  startTime: string;
  cremationTime: number;
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
    private caseService: CaseService
  ) {}

  ngOnInit() {
    this.matStepperIntl.optionalLabel = '';
    this.matStepperIntl.changes.next();
    this.deviceId = this.route.snapshot.paramMap.get('id');
    this.cremationTime = 0;
    this.stepNumber = 0;
    this.case = new Case();
    this.selectedCase$.pipe(skip(1)).subscribe((res) => {
      if (res !== undefined) {
        this.matStepperIntl.optionalLabel =
          res.firstName + ' ' + res.lastName + ' - ' + res.clientCaseId;
        this.matStepperIntl.changes.next();
        this.mapCase(res);
      }
    });
  }

  parseSignalValue(value: string): number{
    return parseInt(value);
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
      this.cremationTime += +data.data;
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
            this.move(3);
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
            this.isCaseSelected = false;
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

  segmentChanged(ev: any) {
    this.selectedBurnMode = ev.detail.value;
    console.log('Segment changed', ev);
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
    this.isCycleStarted = false;
    this.isCoolDownStarted = false;
    this.isRakeOutStarted = false;
    this.appStore.updateSelectedCase({} as Case);
    this.matStepperIntl.optionalLabel = '';
  }

  autoSelectNextCase(deviceId: string) {
    this.caseService
      .getNextCaseForDevice(deviceId)
      .then((nextCase) => this.appStore.updateSelectedCase(nextCase));
  }

  presentCasesModal(deviceId: string) {
    this.appStore.openCasesModal(deviceId);
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
