import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthService } from 'ionic-appauth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  title = 'Identity Mobile Test App2';

  navigate: any;

  constructor(
    private platform: Platform,
    private auth: AuthService
  ) {
    this.initializeApp();
    this.sideMenu();
  }

  sideMenu() {
    this.navigate =
    [
        {
        title : 'Facility',
        url   : '/facility',
        icon  : 'business-outline'
        },
      {
        title : 'Schedule',
        url   : '/schedule',
        icon  : 'calendar-outline'
      },
      {
        title : 'AccountInfo',
        url   : '/accountInfo',
        icon  : 'person-outline'
      },
      {
        title : 'Logout',
        url   : '/logout',
        icon  : 'logout',
      }
    ];
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      await this.auth.init();
      SplashScreen.hide();
    });
  }

}
