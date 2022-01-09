import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDENTITY_SERVICE, IdentityService } from '@matthews-app/identity-common';
import { IDENTITY_EXTRA_CONFIG } from './identity-extra-config.token';
import { IdentityExtraConfig } from './identity-extra.config';
import { flatMap, take } from 'rxjs/operators';

@Injectable()
export class IdentityInterceptor implements HttpInterceptor {
  constructor(
    @Inject(IDENTITY_SERVICE) private identityService: IdentityService,
    @Inject(IDENTITY_EXTRA_CONFIG) private extraConfig: IdentityExtraConfig
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const url = request.url.toLowerCase();

    // Check if interceptor should set token
    if (
      this.extraConfig === undefined ||
      this.extraConfig === null ||
      !this.extraConfig.sendAccessToken ||
      !this.isUrlAllowed(url)
    ) {
      return next.handle(request);
    }

    // Get access token from identity service and attach to request as bearer
    return this.identityService.getInstantAccessToken().pipe(
      flatMap(token => {
        if (token) {
          const header = 'Bearer ' + token;
          const headers = request.headers.set('Authorization', header);
          request = request.clone({ headers });
        }

        return next.handle(request);
      })
    );
  }

  private isUrlAllowed(url: string): boolean {
    if (
      this.extraConfig.allowedUrls &&
      this.extraConfig.allowedUrls.length > 0
    ) {
      return (
        this.extraConfig.allowedUrls.find(u => url.startsWith(u)) !== undefined
      );
    }

    return false;
  }
}
