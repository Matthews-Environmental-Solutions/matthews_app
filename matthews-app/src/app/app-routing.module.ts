import { NgModule } from '@angular/core';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { IdentityLandingGuard } from 'libs/identity/src/lib/identity-landing.guard';
import { IdentityGuard, IdentityGuardConfig } from '@matthews-app/identity';
import { IonicRouteStrategy } from '@ionic/angular';

const identityGuardConfig: IdentityGuardConfig = {
  redirectTo: ['landing']
};

const identityLandingGuardConfig: IdentityGuardConfig = {
  redirectTo: ['']
};

const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },
  {
    path: '',
    redirectTo: 'facility',
    pathMatch: 'full'
  },
  {
    path: 'schedule',
    loadChildren: () => import('./schedule/schedule.module').then( m => m.SchedulePageModule)
  },
  {
    path: 'case',
    loadChildren: () => import('./case/case.module').then( m => m.CasePageModule)
  },
  {
    path: 'case/:id',
    loadChildren: () => import('./case/case.module').then( m => m.CasePageModule)
  },
  {
    path: 'facility',
    loadChildren: () => import('./facility/facility.module').then( m => m.FacilityPageModule)
  },
  {
    path: 'facility/:id',
    loadChildren: () => import('./device-list/device-list.module').then( m => m.DeviceListPageModule)
  },
  {
    path: 'device-list',
    loadChildren: () => import('./device-list/device-list.module').then( m => m.DeviceListPageModule)
  },
  {
    path: 'device/:id',
    loadChildren: () => import('./device-details/device-details.module').then( m => m.DeviceDetailsPageModule)
  },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },
  // {
  //   path: 'landing',
  //   loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule),
  //   canActivate: [IdentityLandingGuard],
  //   data: {
  //     ...identityLandingGuardConfig
  //   }
  // },
  // {
  //   path: 'home',
  //   loadChildren: () =>
  //     import('./home/home.module').then(m => m.HomePageModule),
  //   canActivate: [IdentityGuard],
  //   data: {
  //     ...identityGuardConfig
  //   }
  // }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }]
})
export class AppRoutingModule { }
