/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/quotes */
import { Injectable } from '@angular/core';
import { Facility } from './facility';
import { AuthHttpService } from '../core/auth-http.service';
import { UserInfo } from '../core/userInfo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ResponseCommunicationDto } from '../core/response-communication-dto.model';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  constructor(
    private httpService: AuthHttpService,
    private http: HttpClient
  ) { }

  getFacilities() {
    return this.httpService.request<Facility[]>("GET", environment.i4connectedApiUrl + "/api/sites/details/list");
  }

  getUserInfo(userId: string) {
    return this.httpService.request<UserInfo>("GET", environment.i4connectedApiUrl + "/api/users/" + userId + "/info");
  }

  getAttachment(accessToken: string, photoId: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
    return this.http.get(environment.i4connectedApiUrl + "/api/attachments/" + photoId, { headers: headers, responseType: 'blob' });
  }

  subscribeToGroup(facilityId: string): Promise<ResponseCommunicationDto> {
    const url = `${environment.apiUrl}/Facility/SubscribeToGroup/${facilityId}`;
    return this.httpService.request<ResponseCommunicationDto>('GET', url);
/*
    return this.httpClient.get<ResponseCommunicationDto>(`${environment.apiUrl}/Facility/SubscribeToGroup/${facilityId}`)
      .pipe(retry(1), catchError(this.handleError))
      .pipe(map((response: ResponseCommunicationDto) => {
        return response;
      }));
      */
  }

  unsubscribeFromGroup(facilityId: string): Promise<ResponseCommunicationDto> {
    const url = `${environment.apiUrl}/Facility/UnsubscribeFromGroup/${facilityId}`;
    return this.httpService.request<ResponseCommunicationDto>('GET', url);
    /*
    return this.httpClient.get<ResponseCommunicationDto>(`${environment.apiUrl}/Facility/UnsubscribeFromGroup/${facilityId}`)
      .pipe(retry(1), catchError(this.handleError))
      .pipe(map((response: ResponseCommunicationDto) => {
        return response;
      }));
      */
  }

}
