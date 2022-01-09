import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicGestureConfig } from '../assets/ionic-gesture-config';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPage } from './landing/landing.page';
import { IdentityModule } from '@matthews-app/identity';
import { IdentityMobileModule } from '@matthews-app/identity-mobile';

@NgModule({
  declarations: [AppComponent, LandingPage],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IdentityModule.forRoot({
      sendAccessToken: true,
      allowedUrls: ['http://localhost:8100/']
    }),
    IdentityMobileModule.forRoot({
      client: 'hFa1EBMTGcf6KbAM3Y8HYfdodU8tzZvK',
      debug: true,
      issuer: 'https://dev-x7mj8mbi.us.auth0.com',
      redirectUrl: 'io.ionic.starter://authorizationcallback',
      endSessionRedirectUrl:
        'io.ionic.starter://endsessioncallback',
      requireHttps: false,
      scope: 'profile openid email'
    }),
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
