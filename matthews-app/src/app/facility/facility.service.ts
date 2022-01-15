import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { IFacility } from './facility';
import { AuthHttpService } from '../core/auth-http.service';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private productUrl = 'https://matthewscremation.i4connected.cloud/api/api/sites/list';
  constructor(
    private httpClient: HttpClient,
    private httpService: AuthHttpService
    ) { }

  getFacilities() {
    return this.httpService.request<IFacility[]>("GET", this.productUrl);
  }

  // getFacility(id: string): Observable<IFacility | undefined> {
  //   return this.getFacilities()
  //     .pipe(
  //       map((facility: IFacility[]) => facility.find(c => c.Id === id))
  //     );
  // }
}
