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
export class ExtendCyclePage {
  @Input() selectedDevice: Device;

  extraTimeInterval = 5;
  maxTimeInterval = 480;

  constructor(private popoverController: PopoverController, private appStore: AppStoreService, private cremationProcessService: CremationProcessService) { }

  increseTimeInterval() {
    if(this.extraTimeInterval < this.maxTimeInterval) {
    this.extraTimeInterval++;
    }
  }

  decreseTimeInterval() {
    if(this.extraTimeInterval !== 0 && this.extraTimeInterval !== undefined && this.extraTimeInterval !== null) {
      this.extraTimeInterval --;
    }
  }

  increseForTenMinutes() {
    if (this.extraTimeInterval + 10 <= this.maxTimeInterval) {
      this.extraTimeInterval += 10;
    } else {
      this.extraTimeInterval = this.maxTimeInterval;
    }
  }

  increseForFifteenMinutes() {
    if (this.extraTimeInterval + 15 <= this.maxTimeInterval) {
      this.extraTimeInterval += 15;
    } else {
      this.extraTimeInterval = this.maxTimeInterval;
    }
  }

  increseForThirtyMinutes() {
    if (this.extraTimeInterval + 30 <= this.maxTimeInterval) {
      this.extraTimeInterval += 30;
    } else {
      this.extraTimeInterval = this.maxTimeInterval;
    }
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
