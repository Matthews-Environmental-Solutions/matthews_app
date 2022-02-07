/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { AlertController, AlertOptions, PopoverController } from '@ionic/angular';
import { MatStepper } from '@angular/material/stepper';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';
import { CasePage } from '../case/case.page';
import { ExtendCyclePage } from '../extend-cycle/extend-cycle.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.page.html',
  styleUrls: ['./device-details.page.scss'],
})
export class DeviceDetailsPage implements OnInit {
  selectedCase$ = this.appStore.selectedCase$;
  selectedCrematorName$ = this.appStore.selectedCrematorName$;
  selectedFacility$ = this.appStore.selectedFacility$;
  isPreheatStarted = false;
  isCaseSelected = false;
  isCycleStarted = false;
  isCoolDownStarted = false;
  isRakeOutStarted = false;
  showSearchbar: boolean;
  searchTerm: string;

  constructor(private appStore: AppStoreService, public alertController: AlertController, private popoverController: PopoverController, private translateService: TranslateService) {}

  ngOnInit() {
  }

  startPreheat() {
    this.isPreheatStarted = true;
  }

  stopPreheat() {
    const alertOptions: AlertOptions = {
      header: 'Confirm Preheat Stop',
      message: 'Preheat process will be stopped. Confirm?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
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

  endCycle() {
    const alertOptions: AlertOptions = {
      header: 'End Cycle',
      message: 'The cycle will be stopped. Confirm?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          role: 'confirm',
          handler: () => {
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
  }

  presentCasesModal(facilityId: string) {
    this.appStore.openCasesModal(facilityId);
    this.isCaseSelected = true;
  }
}
