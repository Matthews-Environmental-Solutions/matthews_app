import { Injectable } from '@angular/core';
import { Facility } from './facility';
import { AuthHttpService } from '../core/auth-http.service';
import { UserInfo } from '../core/userInfo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  constructor(
    private httpService: AuthHttpService,
    private http: HttpClient
    ) { }

  getFacilities() {
    return this.httpService.request<Facility[]>("GET", environment.i4connectedApiUrl + "sites/list");
  }

  getUserInfo(userId: string) {
    return this.httpService.request<UserInfo>("GET", environment.i4connectedApiUrl + "users/" + userId + "/info");
  }

  getAttachment(accessToken: string, photoId: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
    return this.http.get(environment.i4connectedApiUrl + "attachments/" + photoId, { headers: headers, responseType: 'blob' });
  }
}
