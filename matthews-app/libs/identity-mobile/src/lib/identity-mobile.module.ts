import {
  NgModule,
  APP_INITIALIZER,
  ModuleWithProviders,
  APP_BOOTSTRAP_LISTENER
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { IdentityMobileService } from './identity-mobile.service';
import { Requestor, StorageBackend } from '@openid/appauth';
import { Platform, IonicModule } from '@ionic/angular';
import { AuthBrowser, CapacitorBrowser } from '@matthews-app/ionic-appauth';

import { storageFactory } from './storage.factory';
import { HttpService } from './http.service';
import { identity } from 'rxjs';
import { identityMobileFactory } from './identity-mobile.factory';
import { IdentityMobileConfig } from './identity-mobile.config';
import { IDENTITY_CONFIG, IDENTITY_SERVICE } from '@matthews-app/identity-common';

@NgModule({
  imports: [CommonModule, IonicModule]
})
export class IdentityMobileModule {
  static forRoot(config: IdentityMobileConfig): ModuleWithProviders<IdentityMobileModule> {
    return {
      ngModule: IdentityMobileModule,
      providers: [
        AuthService,
        IdentityMobileService,
        HttpService,
        {
          provide: StorageBackend,
          useFactory: storageFactory,
          deps: [Platform]
        },
        {
          provide: Requestor,
          useClass: HttpService
        },
        {
          provide: AuthBrowser,
          useClass: CapacitorBrowser
        },
        {
          provide: APP_INITIALIZER,
          useFactory: identityMobileFactory,
          deps: [IDENTITY_CONFIG, AuthService, Platform],
          multi: true
        },
        {
          provide: IDENTITY_CONFIG,
          useValue: config
        },
        {
          provide: IDENTITY_SERVICE,
          useClass: IdentityMobileService
        }
      ]
    };
  }
}
