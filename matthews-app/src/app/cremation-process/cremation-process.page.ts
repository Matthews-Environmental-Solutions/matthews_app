/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { AlertController, AlertOptions, PopoverController } from '@ionic/angular';
import { MatStepper, MatStepperIntl } from '@angular/material/stepper';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';
import { ExtendCyclePage } from '../extend-cycle/extend-cycle.page';
import { TranslateService } from '@ngx-translate/core';
import { SignalRService } from '../core/signal-r.service';


@Component({
  selector: 'app-device-details',
  templateUrl: './cremation-process.page.html',
  styleUrls: ['./cremation-process.page.scss'],
})
export class CremationProcessPage implements OnInit {
  selectedCase$ = this.appStore.selectedCase$;
  selectedCrematorName$ = this.appStore.selectedCrematorName$;
  selectedFacility$ = this.appStore.selectedFacility$;
  signalsMeasurement$ = this.appStore.signalsMeasurement$;
  isPreheatStarted = false;
  isCaseSelected = false;
  isCycleStarted = false;
  isCyclePaused = false;
  isCoolDownStarted = false;
  isRakeOutStarted = false;
  showSearchbar: boolean;
  searchTerm: string;

  constructor(private appStore: AppStoreService,
              private popoverController: PopoverController,
              private translateService: TranslateService,
              private matStepperIntl: MatStepperIntl,
              private signalRService: SignalRService,
              public alertController: AlertController) {}

  ngOnInit() {
    this.matStepperIntl.optionalLabel ="";
    this.matStepperIntl.changes.next();
    this.signalRService.initializeSignalRConnection();
  }

  startPreheat() {
    this.isPreheatStarted = true;

    this.selectedCrematorName$.subscribe((response) => {
      //this.appStore.getEwonPreheatValue(response);
      this.appStore.getSecondaryChamberTempValues(response);
      this.appStore.getPrimaryChamberTempValues(response);

    })
  }

  stopPreheat() {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmPreheatStop'),
      message: this.translateService.instant('ConfirmPreheatStopMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.isPreheatStarted = false;
          }
        }
      ]
    };

    this.presentAlert(alertOptions);
  }

  selectCase() {
    this.isCaseSelected = true;
  }

  changeCase(facilityId: string) {
    this.presentCasesModal(facilityId);
  }

  startCycle() {
    this.isCycleStarted = true;
  }

  pauseCycle() {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmPauseCycle'),
      message: this.translateService.instant('ConfirmPauseCycleMessage'),
      buttons: [
        {
          text: this.translateService.instant('No'),
          role: 'no'
        },
        {
          text: this.translateService.instant('Yes'),
          role: 'yes',
          handler: () => {
            this.isCyclePaused = true;
          }
        }
      ]
    };

    this.presentAlert(alertOptions);
  }

  resumeCycle() {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmResumeCycle'),
      message: this.translateService.instant('ConfirmResumeCycleMessage'),
      buttons: [
        {
          text: this.translateService.instant('No'),
          role: 'no'
        },
        {
          text: this.translateService.instant('Yes'),
          role: 'yes',
          handler: () => {
            this.isCyclePaused = false;
          }
        }
      ]
    };

    this.presentAlert(alertOptions);
  }

  extendCycle() {

  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ExtendCyclePage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  endCycle(stepper: MatStepper) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('EndCycle'),
      message: this.translateService.instant('EndCycleMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.goToNextStep(stepper);
          }
        }
      ]
    };

    this.presentAlert(alertOptions);
  }

  coolDown() {
    this.isCoolDownStarted = true;
  }

  rakeOut() {
    this.isRakeOutStarted = true;
  }

  rakeOutConfirmation(stepper: MatStepper) {
    const alertOptions: AlertOptions = {
      header: this.translateService.instant('ConfirmRakeOut'),
      message: this.translateService.instant('ConfirmRakeOutMessage'),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('Confirm'),
          role: 'confirm',
          handler: () => {
            this.resetStepper(stepper);
          }
        }
      ]
    };

    this.presentAlert(alertOptions);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  segmentChanged(ev: any) {
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
    this.appStore.updateSelectedCase( {} as Case);
    this.matStepperIntl.optionalLabel ="";
  }

  presentCasesModal(facilityId: string) {
    this.appStore.openCasesModal(facilityId);
    this.isCaseSelected = true;

    this.selectedCase$.subscribe(res => {
      if(res !== undefined) {
        this.matStepperIntl.optionalLabel = res.caseName + " - " + res.caseId;
        this.matStepperIntl.changes.next();
      }
    });
    // Required for the optional label text to be updated
    // Notifies the MatStepperIntl service that a change has been made

  }

  goToNextStep(stepper: MatStepper) {
    stepper.next();
    console.log("Stepper");
  }
}
