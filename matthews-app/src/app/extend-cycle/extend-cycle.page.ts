import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-extend-cycle',
  templateUrl: './extend-cycle.page.html',
  styleUrls: ['./extend-cycle.page.scss'],
})
export class ExtendCyclePage implements OnInit {

  extraTimeInterval = 5;

  constructor(private popoverController: PopoverController) { }

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
    this.popoverController.dismiss();
  }

  onCancel() {
    this.popoverController.dismiss();
  }
}
