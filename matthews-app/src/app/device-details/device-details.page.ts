/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MatStepper } from '@angular/material/stepper';
import { AppStoreService } from '../app.store.service';

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

  constructor(private appStore: AppStoreService, public alertController: AlertController) {}

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
      header: 'Alert',
      subHeader: 'Subtitle',
      message: 'This is an alert message.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.resetStepper(stepper);
  }

  resetStepper(stepper: MatStepper) {
    this.isPreheatStarted = false;
    this.isCaseSelected = false;
    this.isCycleStarted = false;
    this.isCoolDownStarted = false;
    this.isRakeOutStarted = false;
    stepper.reset();
  }

  presentCasesModal() {
    this.appStore.openCasesModal();
  }
}
