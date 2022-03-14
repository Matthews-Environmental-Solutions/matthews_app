import { Component, OnInit } from '@angular/core';
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
  selectedDevice$ = this.appStore.selectedDevice$;

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

  onConfirm(selectedDevice: Device) {
    const signal = selectedDevice.signals.find(signal => signal.name == "Ewon_Time_to_Add_(Mins)");
    this.cremationProcessService.writeSignalValue(signal?.id, this.extraTimeInterval);
    this.popoverController.dismiss();
  }

  onCancel() {
    this.popoverController.dismiss();
  }
}
