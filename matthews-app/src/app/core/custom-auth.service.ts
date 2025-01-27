import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';// Adjust to your environment
import { AuthService } from 'ionic-appauth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomAuthService extends AuthService {
  constructor(private http: HttpClient) {
    super(); // Initialize AuthService
  }

  refreshTokenManually(refreshToken: string): Promise<void> {
    const tokenRequestPayload = {
      grant_type: 'refresh_token',
      client_id: environment.auth_config.client_id,
      client_secret: environment.auth_config.client_secret, // Include the secret here
      refresh_token: refreshToken,
      redirect_uri: environment.auth_config.redirect_url,
    };
  
    return this.http.post('https://matthewsenvironmental.i4connected.cloud/identity/connect/token', tokenRequestPayload)
      .toPromise()  // Return a promise here
      .then((response: any) => {
        // Handle success, save the new token
        console.log('Token refreshed successfully', response);
      })
      .catch((error) => {
        console.error('Error refreshing token:', error);
        throw error; // Rethrow to handle in the calling method
      });
  }
  
}
