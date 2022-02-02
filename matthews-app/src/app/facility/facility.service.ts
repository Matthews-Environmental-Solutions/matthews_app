import { Injectable } from '@angular/core';
import { Facility } from './facility';
import { AuthHttpService } from '../core/auth-http.service';
import { AuthService } from 'ionic-appauth';
import { UserInfo } from '../core/userInfo';
import { TokenResponse } from '@openid/appauth';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private productUrl = 'https://matthewscremation.i4connected.cloud/api/api/';

  constructor(
    private httpService: AuthHttpService,
    private http: HttpClient
    ) { }

  getFacilities() {
    return this.httpService.request<Facility[]>("GET", this.productUrl + "sites/list");
  }

  getUserInfo(userId: string) {
    return this.httpService.request<UserInfo>("GET", this.productUrl + "users/" + userId + "/info");
  }

  getAttachment(accessToken: string, photoId: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
    return this.http.get(this.productUrl + "attachments/" + photoId, { headers: headers, responseType: 'blob' });
  }
}
