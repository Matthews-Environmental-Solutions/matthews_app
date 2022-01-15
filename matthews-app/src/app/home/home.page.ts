import { Component, Inject } from '@angular/core';
import { IDENTITY_SERVICE } from '@matthews-app/identity-common';
import { IdentityMobileService } from '@matthews-app/identity-mobile';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  {
  whoAmI = this.identityService.whoAmI;

  constructor(
    @Inject(IDENTITY_SERVICE) private identityService: IdentityMobileService,
    private http: HttpClient
  ) {}

  logOut() {
    this.identityService.logOut();
  }

  testService() {
    this.http
      .get('http://10.1.0.69:55002/api/Metadata/MetadataEditor')
      .subscribe(
        response => {
          alert('SUCCESS');
        },
        error => {
          alert('ERROR');
        }
      );
  }
}
