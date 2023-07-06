/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { AlertController, AlertOptions, PopoverController } from '@ionic/angular';
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

@Component({
  selector: 'app-device-details',
  templateUrl: './cremation-process.page.html',
  styleUrls: ['./cremation-process.page.scss'],
})
export class CremationProcessPage implements OnInit {
  selectedCase$ = this.appStore.selectedCase$;
  selectedDevice$ = this.appStore.selectedDevice$;
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
  showSearchbar: boolean;
  searchTerm: string;
  deviceId: string;
  selectedBurnMode: number;
  chamberStatus = ChamberStatus;
  startHour: number;
  startMinute: number;
  startTime: string;
  timeLeft: number;
  interval;

  burnMode = BurnMode;
  burnModeKeys = Object.keys(BurnMode).filter((x) => parseInt(x, 10) >= 0);

  constructor(
    private appStore: AppStoreService,
    private popoverController: PopoverController,
    private translateService: TranslateService,
    private matStepperIntl: MatStepperIntl,
    private route: ActivatedRoute,
    private cremationProcessService: CremationProcessService,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    this.matStepperIntl.optionalLabel = '';
    this.matStepperIntl.changes.next();
    this.deviceId = this.route.snapshot.paramMap.get('id');
  }

  setStartTime() {
    const currentDate = new Date();
    this.startHour = currentDate.getHours();
    this.startMinute = currentDate.getMinutes();
    if (this.startMinute > 9) {
      this.startTime = this.startHour.toString() + ':' + this.startMinute.toString();
    } else {
      this.startTime = this.startHour.toString() + ':' + '0' + this.startMinute.toString();
    }
    this.startTimer();
  }

  startTimer() {
    this.timeLeft = 10;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
    }, 60000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  startPreheat(selectedDevice: Device) {
    this.isPreheatStarted = true;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'PREHEAT'
    );
    console.log('SignalId' + signal.id);
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
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
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
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
    this.pauseTimer();
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

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
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
            this.goToNextStep(stepper);
          },
        },
      ],
    };

    this.presentAlert(alertOptions);
  }

  coolDown(selectedDevice: Device) {
    this.isCoolDownStarted = true;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'COOLDOWN'
    );
    console.log('Signal ID: ' + signal?.id);
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
  }

  rakeOut(selectedDevice: Device) {
    this.isRakeOutStarted = true;
    const signal = selectedDevice.signals.find(
      (signal) => signal.name === 'RAKE_OUT'
    );
    this.cremationProcessService.writeSignalValue(signal?.id, 1);
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

  presentCasesModal(facilityId: string) {
    this.appStore.openCasesModal(facilityId);
    this.isCaseSelected = true;

    this.selectedCase$.subscribe((res) => {
      if (res !== undefined) {
        this.matStepperIntl.optionalLabel =
          res.firstName + ' ' + res.lastName + ' - ' + res.clientCaseId;
        this.matStepperIntl.changes.next();
      }
    });
    // Required for the optional label text to be updated
    // Notifies the MatStepperIntl service that a change has been made
  }

  goToNextStep(stepper: MatStepper) {
    stepper.next();
    console.log('Stepper');
  }
}
