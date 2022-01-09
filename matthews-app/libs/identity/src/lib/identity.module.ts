import {
  NgModule,
  ModuleWithProviders,
  APP_INITIALIZER,
  Provider
} from '@angular/core';
import { IdentityExtraConfig } from './identity-extra.config';
import { IDENTITY_EXTRA_CONFIG } from './identity-extra-config.token';
import { IdentityInterceptor } from './identity.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { IdentityGuard } from './identity.guard';
import { IdentityLandingGuard } from './identity-landing.guard';

/**
 * IdentityModule
 *
 * @export
 */
@NgModule({})
export class IdentityModule {
  static forRoot(
    config?: IdentityExtraConfig
  ): ModuleWithProviders<IdentityModule> {
    return {
      ngModule: IdentityModule,
      providers: [
        IdentityInterceptor,
        IdentityGuard,
        IdentityLandingGuard,
        {
          provide: IDENTITY_EXTRA_CONFIG,
          useValue: config
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: IdentityInterceptor,
          multi: true
        }
      ]
    };
  }
}
