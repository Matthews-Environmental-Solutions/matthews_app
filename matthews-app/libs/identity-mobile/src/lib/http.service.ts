import { Injectable } from '@angular/core';
import { Requestor } from '@openid/appauth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { XhrSettings } from '@matthews-app/ionic-appauth';

@Injectable()
export class HttpService implements Requestor {
  constructor(private http: HttpClient) {}

  public async xhr<T>(settings: XhrSettings): Promise<T> {
    if (!settings.method) {
      settings.method = 'GET';
    }

    switch (settings.method) {
      case 'GET':
        return this.http
          .get<T>(settings.url, { headers: this.getHeaders(settings.headers) })
          .toPromise();
      case 'POST':
        return this.http
          .post<T>(settings.url, settings.data, {
            headers: this.getHeaders(settings.headers)
          })
          .toPromise();
      case 'PUT':
        return this.http
          .put<T>(settings.url, settings.data, {
            headers: this.getHeaders(settings.headers)
          })
          .toPromise();
      case 'DELETE':
        return this.http
          .delete<T>(settings.url, {
            headers: this.getHeaders(settings.headers)
          })
          .toPromise();
    }
  }

  private getHeaders(headers: any): HttpHeaders {
    let httpHeaders: HttpHeaders = new HttpHeaders();

    if (headers !== undefined) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.append(key, headers[key]);
      });
    }

    return httpHeaders;
  }
}
