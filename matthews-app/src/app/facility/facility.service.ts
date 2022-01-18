import { Injectable } from '@angular/core';
import { Facility } from './facility';
import { AuthHttpService } from '../core/auth-http.service';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private productUrl = 'https://matthewscremation.i4connected.cloud/api/api/sites/list';
  constructor(
    private httpService: AuthHttpService
    ) { }

  getFacilities() {
    return this.httpService.request<Facility[]>("GET", this.productUrl);
  }
}
