/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable max-len */
import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { CremationProcessService } from '../cremation-process/cremation-process.service';
import { Device } from '../device-list/device';

@Component({
  selector: 'app-extend-cycle',
  templateUrl: './extend-cycle.page.html',
  styleUrls: ['./extend-cycle.page.scss'],

})
export class ExtendCyclePage implements OnInit {
  @Input() selectedDevice: Device;

  extraTimeInterval = 5;

  constructor(private popoverController: PopoverController, private appStore: AppStoreService, private cremationProcessService: CremationProcessService) { }

  ngOnInit() {
  }

  increseTimeInterval() {
    this.extraTimeInterval++;
  }

  decreseTimeInterval() {
    if(this.extraTimeInterval !== 0 && this.extraTimeInterval !== undefined && this.extraTimeInterval !== null) {
      this.extraTimeInterval --;
    }
  }

  increseForTenMinutes() {
    this.extraTimeInterval += 10;
  }

  increseForFifteenMinutes() {
    this.extraTimeInterval += 15;
  }

  increseForThirtyMinutes() {
    this.extraTimeInterval += 30;
  }

  onConfirm() {
    const signal = this.selectedDevice.signals.find(signal => signal.name == 'ADD_TIME');
    this.cremationProcessService.writeSignalValue(signal?.id, this.extraTimeInterval);
    this.popoverController.dismiss(this.extraTimeInterval);
  }

  onCancel() {
    this.popoverController.dismiss(0);
  }
}
