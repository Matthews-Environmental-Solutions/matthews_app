import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { IdentityWebService } from './identity-web.service';
import { identityWebFactory } from './identity-web.factory';
import { IDENTITY_CONFIG, IDENTITY_SERVICE } from '@matthews-app/identity-common';
import { IdentityWebConfig } from './identity-web.config';

@NgModule({
  imports: [OAuthModule.forRoot()]
})
export class IdentityWebModule {
  static forRoot(
    config: IdentityWebConfig
  ): ModuleWithProviders<IdentityWebModule> {
    return {
      ngModule: IdentityWebModule,
      providers: [
        IdentityWebService,
        {
          provide: APP_INITIALIZER,
          useFactory: identityWebFactory,
          deps: [IDENTITY_CONFIG, OAuthService],
          multi: true
        },
        {
          provide: IDENTITY_CONFIG,
          useValue: config
        },
        {
          provide: IDENTITY_SERVICE,
          useClass: IdentityWebService
        }
      ]
    };
  }
}
