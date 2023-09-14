/* eslint-disable arrow-body-style */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacilityStatus } from './facility-status.model';
import { catchError, tap } from 'rxjs/operators';
import { AuthHttpService } from '../core/auth-http.service';

@Injectable({
  providedIn: 'root',
})
export class FacilityStatusService {
  apiURL = environment.apiUrl;

  constructor(private httpService: AuthHttpService) {}

  getAllStatusesByFacility(facilityId: string) {
    const getFacilityUrl = `${this.apiURL}/FacilityStatus/GetFacilityStatusesByFacility/${facilityId}`;
    return this.httpService.request<FacilityStatus[]>('GET', getFacilityUrl, facilityId);
  }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // window.alert(errorMessage);

    return throwError(() => {
      return errorMessage;
    });
  }
}
