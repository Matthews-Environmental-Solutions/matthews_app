/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @angular-eslint/component-selector */
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthService } from 'ionic-appauth';
import { AppStoreService } from './app.store.service';
import { TranslateService } from '@ngx-translate/core';
import { CremationProcessService } from './cremation-process/cremation-process.service';
import { CaseService } from './case/case.service';
import { AuthEventHandlerService } from './core/auth-event-handler.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{

  navigate: any;
  userInfo$ = this.appStoreService.userInfo$;
  language: string;
  darkModeSliderValue: boolean;
  demoFacilityExists$ = this.appStoreService.facilities$.pipe(
    map(facilities => facilities.some(f => f.name?.includes('[DEMO]')))
  );

  constructor(
    private platform: Platform,
    private auth: AuthService,
    private appStoreService: AppStoreService,
    public translateService: TranslateService,
    public cremationProcessService: CremationProcessService,
    public caseService: CaseService,
    private authEventHandler: AuthEventHandlerService
  ) {
    this.initializeApp();
    this.sideMenu();

    this.translateService.addLangs(['en', 'de']);
    this.translateService.setDefaultLang('en');
    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use(browserLang.match(/en|de/) ? browserLang : 'en');
    this.language = this.translateService.currentLang;


  }

  ngOnInit() {
    this.initializeTheme();
  }

  sideMenu() {
    this.navigate =
    [
      {
        title : this.translateService.instant('Facility'),
        url   : '/app/tabs/facility',
        icon  : 'business-outline'
      },
      {
        title : this.translateService.instant('Schedule'),
        url   : '/app/tabs/schedule',
        icon  : 'calendar-outline'
      },
      {
        title : this.translateService.instant('Logout'),
        url   : '/logout',
        icon  : 'log-out-outline'
      }
    ];
  }

  // initializeApp() {
  //   this.platform.ready().then(async () => {
  //     await this.auth.init();
  //     SplashScreen.hide();
  //   });
  // }

  async initializeApp() {
    await this.platform.ready();
    await this.auth.init();  // Ensure this completes
    SplashScreen.hide();     // Hide the splash screen after auth is ready
    this.authEventHandler.initialize();
  }


  languageChange() {
    this.translateService.use(this.language);
  }

  resetDemo() {
    const signalId = "dd121ea5-12f5-4430-9f32-303b6e353291";
    //const signalId = "ab36c612-42fb-481b-8050-0b5b207cfe6b";
    this.cremationProcessService.writeSignalValue(signalId, 1);
    this.caseService.resetDemo();
    console.log('Reseted Demo');
  }

  initializeTheme() {
    this.applyTheme(this.darkModeSliderValue);
  }

  toggleTheme(event: any) {
    this.darkModeSliderValue = event.detail.checked;
    this.applyTheme(this.darkModeSliderValue);
  }

  applyTheme(isDarkMode: boolean) {
    const rootElement = document.documentElement || document.body;
    rootElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }

  updateColorScheme(event: MediaQueryListEvent) {
    if (event.matches) {
      this.applyTheme(true);
    } else {
      this.applyTheme(false);
    }
  }
}
