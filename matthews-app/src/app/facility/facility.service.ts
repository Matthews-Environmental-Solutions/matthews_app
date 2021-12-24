import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IFacility } from './facility';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private productUrl = '../../assets/facilities.json';
  constructor(private httpClient: HttpClient) { }

  getFacilities(): Observable<IFacility[]> {
    return this.httpClient.get<IFacility[]>(this.productUrl)
      .pipe(
        tap(data => console.log('All: ', JSON.stringify(data)))
      );
  }

  getFacility(id: string): Observable<IFacility | undefined> {
    return this.getFacilities()
      .pipe(
        map((facility: IFacility[]) => facility.find(c => c.facilityId === id))
      );
  }
}
