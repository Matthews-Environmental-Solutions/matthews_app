import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthHttpService } from './auth-http.service';

@Injectable({
  providedIn: 'root'
})
export class DemoService {

  constructor(
    private httpService: AuthHttpService
  ) { }

  IsUseDemoEntitiesOnly(): Promise<{ useDemoEntitiesOnly: boolean }> {
    return this.httpService.request<{ useDemoEntitiesOnly: boolean }>('GET', environment.apiUrl + "/Demo/IsUseDemoEntitiesOnly");
  }

}
