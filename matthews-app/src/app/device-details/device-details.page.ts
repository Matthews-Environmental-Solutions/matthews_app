import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.page.html',
  styleUrls: ['./device-details.page.scss'],
})
export class DeviceDetailsPage implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  isPreheatStarted = false;
  isCaseSelected = false;
  isCycleStarted = false;
  isCoolDownStarted = false;
  isRakeOutStarted = false;
  showSearchbar: boolean;
  searchTerm: string;

  constructor(private _formBuilder: FormBuilder, public alertController: AlertController) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required],
    });
    this.fourthFormGroup = this._formBuilder.group({
      fourthCtrl: ['', Validators.required],
    });
  }

  startPreheat()
  {
    //call StartPreheat on API
    this.isPreheatStarted = true;
  }

  stopPreheat() {
    this.isPreheatStarted = false;
  }

  selectCase() {
    this.isCaseSelected = true;
  }

  changeCase() {

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

  async presentAlert() {
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
  }
}