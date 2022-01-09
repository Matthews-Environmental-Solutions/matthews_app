import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { IdentityEvent, IdentityService, IDENTITY_SERVICE } from '@matthews-app/identity-common';
import { IdentityMobileService } from '@matthews-app/identity-mobile';
import { AuthActions, IAuthAction } from '@matthews-app/ionic-appauth';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Identity Mobile Test App2';

  navigate: any;

  constructor(
    @Inject(IDENTITY_SERVICE) private identityService: IdentityService,
    private platform: Platform,
    private router: Router
  ) {
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
      }
    ];
  }

  ngOnInit(): void {
    if (this.platform.is('capacitor')) {
      this.identityService.events.subscribe(
        (identityEvent: IdentityEvent<IAuthAction>) => {
          if (
            identityEvent.from === 'mobile' &&
            (identityEvent.event.action === AuthActions.AutoSignInFailed ||
              identityEvent.event.action === AuthActions.RefreshFailed ||
              identityEvent.event.action === AuthActions.SignInFailed ||
              identityEvent.event.action === AuthActions.SignOutFailed ||
              identityEvent.event.action === AuthActions.SignOutSuccess)
          ) {
            this.router.navigate(['landing']);
          }

          if (
            identityEvent.from === 'mobile' &&
            (identityEvent.event.action === AuthActions.AutoSignInSuccess ||
              identityEvent.event.action === AuthActions.RefreshSuccess ||
              identityEvent.event.action === AuthActions.SignInSuccess)
          ) {
            this.router.navigate(['']);
          }
        }
      );

      (this.identityService as IdentityMobileService).silentLogIn();
    }

   SplashScreen.hide();
  }

}
