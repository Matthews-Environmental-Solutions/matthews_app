import { Component, Inject } from '@angular/core';
import { IDENTITY_SERVICE } from '@matthews-app/identity-common';
import { IdentityMobileService } from '@matthews-app/identity-mobile';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {
  constructor(
    @Inject(IDENTITY_SERVICE) private identityService: IdentityMobileService
  ) {}

  logIn() {
    this.identityService.logIn();
  }
}

