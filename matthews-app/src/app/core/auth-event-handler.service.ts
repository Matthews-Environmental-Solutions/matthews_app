import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthActions, IAuthAction } from 'ionic-appauth';
import { CustomAuthService } from './custom-auth.service'; // Import your custom service

@Injectable({
  providedIn: 'root',
})
export class AuthEventHandlerService {
  constructor(
    private customAuthService: CustomAuthService, // Inject CustomAuthService
    private navCtrl: NavController
  ) {
    this.initialize();
  }

  private initialize(): void {
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
          this.startTokenMonitor(); // Start monitoring token expiration
          break;

        default:
          console.log('Auth event:', action.action);
      }
    });
  }

  private startTokenMonitor(): void {
    const bufferTimeInSeconds = 300; // Adjust this buffer time as needed
    this.customAuthService.getValidToken().then((token) => {
      console.log('Token expires in:', token.expiresIn);
      const expiresIn = token.expiresIn ? token.expiresIn : 3600; // Default to 1 hour if undefined
      const refreshTime = expiresIn - bufferTimeInSeconds;

      setTimeout(() => {
        // Replace the call to refreshToken() with your custom refresh token logic
        this.customAuthService.refreshTokenManually(token.refreshToken).catch((error) => {
          console.error('Error refreshing token:', error);
          this.navCtrl.navigateRoot('landing'); // Handle refresh failure
        });
      }, refreshTime * 1000); // Convert to milliseconds
    });
  }
}
