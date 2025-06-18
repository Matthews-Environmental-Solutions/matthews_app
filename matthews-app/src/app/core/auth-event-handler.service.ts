import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthActions, AuthService, IAuthAction } from 'ionic-appauth';
import { CustomAuthService } from './custom-auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthEventHandlerService {
  constructor(
    private customAuthService: AuthService, // Inject CustomAuthService
    private navCtrl: NavController
  ) {}

  initialize(): void {
    this.customAuthService.events$.subscribe((action: IAuthAction) => {
      switch (action.action) {
        case AuthActions.SignInFailed:
        case AuthActions.SignOutSuccess:
          this.navCtrl.navigateRoot('landing');
          break;

        case AuthActions.RefreshFailed:
          console.warn('Token refresh failed. Redirecting to login.');
          this.navCtrl.navigateRoot('landing');
          break;

        case AuthActions.SignInSuccess:
        case AuthActions.RefreshSuccess:
        case AuthActions.LoadTokenFromStorageSuccess:
          this.startTokenMonitor(); // Start monitoring token expiration
          break;

        default:
          console.log('Auth event:', action.action);
      }
    });
  }

  triggerRefresh() {
    (this.customAuthService as CustomAuthService)
      .refreshTokenManually()
      .catch((error) => {
        console.error('Error refreshing token:', error);
        this.navCtrl.navigateRoot('landing'); // Handle refresh failure
      });
  }

  private startTokenMonitor(): void {
    const bufferTimeInSeconds = 300; 
  
    this.customAuthService.getValidToken().then((token) => {
      console.log('Token expires in:', token.expiresIn);
      const expiresIn = token.expiresIn ?? 3600; // Default to 1 hour if undefined
  
      let refreshTime = expiresIn - bufferTimeInSeconds;
  
      // Prevent negative or too-low values
      if (refreshTime < 10) {
        refreshTime = 10; // Always give at least 10s buffer
      }
  
      console.log(`Scheduling token refresh in ${refreshTime} seconds`);
  
      setTimeout(() => {
        (this.customAuthService as CustomAuthService)
          .refreshTokenManually()
          .catch((error) => {
            console.error('Error refreshing token:', error);
            this.navCtrl.navigateRoot('landing');
          });
      }, refreshTime * 1000);
    });
  }
  
}
