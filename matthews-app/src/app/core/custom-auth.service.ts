import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';// Adjust to your environment
import { AuthActionBuilder, AuthService, Browser } from 'ionic-appauth';
import { environment } from 'src/environments/environment';
import { StorageBackend, Requestor, GRANT_TYPE_REFRESH_TOKEN, TokenRequestJson, TokenResponse, TokenRequest } from '@openid/appauth'

const TOKEN_RESPONSE_KEY = "token_response";

@Injectable({
  providedIn: 'root'
})
export class CustomAuthService extends AuthService {
  private http: HttpClient;
  constructor(browser: Browser, storage: StorageBackend, requestor: Requestor, http: HttpClient) {
    super(browser, storage, requestor); // Initialize AuthService

    this.http = http;
  }

  protected override async requestTokenRefresh(): Promise<void> {
    debugger
    if(!this['_tokenSubject'].value){
      throw new Error("No Token Defined!");
    }

    let requestJSON = {
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      refresh_token: this['_tokenSubject'].value?.refreshToken,
      client_secret: environment.auth_config.client_secret,
      redirect_uri: this.authConfig.redirect_url,
      client_id: this.authConfig.client_id,
    }    
    let token : TokenResponse = await this.tokenHandler.performTokenRequest(await this.configuration, new TokenRequest(requestJSON))
    await this.storage.setItem(TOKEN_RESPONSE_KEY, JSON.stringify(token.toJson()));
    this.notifyActionListers(AuthActionBuilder.RefreshSuccess(token));
  }

  refreshTokenManually(refreshToken: string): Promise<void> {
    const tokenRequestPayload = {
      grant_type: 'refresh_token',
      client_id: environment.auth_config.client_id,
      client_secret: environment.auth_config.client_secret, 
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
