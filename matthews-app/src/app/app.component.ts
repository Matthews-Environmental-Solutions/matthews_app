import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthService } from 'ionic-appauth';
import { AppStoreService } from './app.store.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  navigate: any;
  userInfo$ = this.appStoreService.userInfo$;

  constructor(
    private platform: Platform,
    private auth: AuthService,
    private appStoreService: AppStoreService
  ) {
    this.initializeApp();
    this.sideMenu();
  }

  sideMenu() {
    this.navigate =
    [
      {
        title : 'Facility',
        url   : '/app/tabs/facility',
        icon  : 'business-outline'
      },
      {
        title : 'Schedule',
        url   : '/app/tabs/schedule',
        icon  : 'calendar-outline'
      },
      {
        title : 'Logout',
        url   : '/logout',
        icon  : 'log-out-outline'
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
