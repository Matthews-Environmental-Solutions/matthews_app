/* eslint-disable max-len */
/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { MatStepper } from '@angular/material/stepper';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';
import { CasePage } from '../case/case.page';
import { ExtendCyclePage } from '../extend-cycle/extend-cycle.page';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.page.html',
  styleUrls: ['./device-details.page.scss'],
})
export class DeviceDetailsPage implements OnInit {
  selectedCase$ = this.appStore.selectedCase$;
  isPreheatStarted = false;
  isCaseSelected = false;
  isCycleStarted = false;
  isCoolDownStarted = false;
  isRakeOutStarted = false;
  showSearchbar: boolean;
  searchTerm: string;

  constructor(private appStore: AppStoreService, public alertController: AlertController, private popoverController: PopoverController) {}

  ngOnInit() {
  }

  startPreheat() {
    this.isPreheatStarted = true;
  }

  stopPreheat() {
    this.isPreheatStarted = false;
  }

  selectCase() {
    this.isCaseSelected = true;
  }

  changeCase() {
    this.presentCasesModal();
  }

  startCycle() {
    this.isCycleStarted = true;
  }

  pauseCycle() {

  }

  extendCycle() {
    // this.presentPopover();
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

  }

  coolDown() {
    this.isCoolDownStarted = true;
  }

  rakeOut() {
    this.isRakeOutStarted = true;
  }

  rakeOutConfirmation() {

  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }

  async presentAlert(stepper: MatStepper) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm Rake Out',
      subHeader: '',
      message: 'Choosing Complete will end this process cycle and reset all case information. The machine will be ready to begin a new process. Confirm?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.resetStepper(stepper);
          }
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  resetStepper(stepper: MatStepper) {
    this.isPreheatStarted = false;
    this.isCaseSelected = false;
    this.isCycleStarted = false;
    this.isCoolDownStarted = false;
    this.isRakeOutStarted = false;
    stepper.reset();
    this.appStore.updateSelectedCase( {} as Case);
  }

  presentCasesModal() {
    this.appStore.openCasesModal();
    this.isCaseSelected = true;
  }
}
