import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  templateUrl: './tabs-page.page.html',
})
export class TabsPagePage {
  constructor(private navCtrl: NavController) {}

  setRootTab(event: any): void {
    switch (event?.tab) {
      case 'schedule':
          this.navCtrl.navigateRoot('app/tabs/schedule');
        break;
      case 'facility':
        this.navCtrl.navigateRoot('app/tabs/facility');
        break;
      default:
    }
  }
}
