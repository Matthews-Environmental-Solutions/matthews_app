import { Injectable } from '@angular/core';
import { Facility } from './facility';
import { AuthHttpService } from '../core/auth-http.service';
import { UserInfo } from '../core/userInfo';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private productUrl = 'https://matthewscremation.i4connected.cloud/api/api/';
  constructor(
    private httpService: AuthHttpService
    ) { }

  getFacilities() {
    return this.httpService.request<Facility[]>("GET", this.productUrl + "sites/list");
  }

  getUserInfo(userId: string) {
    return this.httpService.request<UserInfo>("GET", this.productUrl + "users/" + userId + "/info");
  }

  getAttachment(photoId: string) {
    return this.httpService.request<File>("GET", this.productUrl + "attachments/" + photoId, {responseType: "blob"});
  }
}
