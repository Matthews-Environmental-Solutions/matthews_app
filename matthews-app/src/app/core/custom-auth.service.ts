import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; // Adjust to your environment
import { AuthActionBuilder, AuthService, Browser } from 'ionic-appauth';
import { environment } from 'src/environments/environment';
import {
  StorageBackend,
  Requestor,
  GRANT_TYPE_REFRESH_TOKEN,
  TokenRequestJson,
  TokenResponse,
  TokenRequest,
} from '@openid/appauth';

const TOKEN_RESPONSE_KEY = 'token_response';

@Injectable({
  providedIn: 'root',
})
export class CustomAuthService extends AuthService {
  private http: HttpClient;
  constructor(
    browser: Browser,
    storage: StorageBackend,
    requestor: Requestor,
    http: HttpClient
  ) {
    super(browser, storage, requestor); // Initialize AuthService

    this.http = http;
  }

  protected override async requestTokenRefresh(): Promise<void> {
    if (!this['_tokenSubject'].value) {
      throw new Error('No Token Defined!');
    }

    let requestJSON = {
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      refresh_token: this['_tokenSubject'].value?.refreshToken,
      client_secret: environment.auth_config.client_secret,
      redirect_uri: environment.auth_config.redirect_url,
      client_id: environment.auth_config.client_id,
    };

    // let tokenRequest = new TokenRequest(requestJSON);
    // tokenRequest['client_secret'] = environment.auth_config.client_secret;
    // let token : TokenResponse = await this.tokenHandler.performTokenRequest(await this.configuration, tokenRequest)

    // It is important to send the request as application/x-www-form-urlencoded
    // so we need to convert the requestJSON to a URL-encoded string
    let tokenResponse = await this.http
      .post(
        `${environment.auth_config.server_host}/connect/token`,
        `grant_type=${requestJSON.grant_type}&client_secret=${requestJSON.client_secret}&client_id=${requestJSON.client_id}&redirect_uri=${requestJSON.redirect_uri}&refresh_token=${requestJSON.refresh_token}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .toPromise(); // Return a promise here

    // Ensure the response is of type TokenResponse
    let token: TokenResponse = new TokenResponse(tokenResponse as any);

    await this.storage.setItem(
      TOKEN_RESPONSE_KEY,
      JSON.stringify(tokenResponse)
    );
    this.notifyActionListers(AuthActionBuilder.RefreshSuccess(token));
  }

  refreshTokenManually(): Promise<void> {
    return this.refreshToken();
  }
}
