/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { NgModule, NgZone } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicGestureConfig } from '../assets/ionic-gesture-config';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PipesModule } from './pipes/pipes.module';
import { MatIconModule} from '@angular/material/icon';
import { AuthService, Browser } from 'ionic-appauth';
import { authFactory } from './core/factories';
import { Requestor, StorageBackend } from '@openid/appauth';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, 'assets/i18n/');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatIconModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    PipesModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig },
    DatePipe,
    {
      provide: AuthService,
      useFactory : authFactory,
      deps: [Platform, NgZone, Requestor, Browser, StorageBackend, HttpClient]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
