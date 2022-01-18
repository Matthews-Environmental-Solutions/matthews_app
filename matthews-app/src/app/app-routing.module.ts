import { NgModule } from '@angular/core';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { AuthGuardService } from './core/auth-guard.service';

const routes: Routes = [
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
    canActivate: [AuthGuardService],
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
  {
    path: 'landing',
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'logout',
    loadChildren: () => import('./logout/logout.module').then( m => m.LogoutPageModule)
  },
  {
    path: 'auth/authorizationcallback', loadChildren: () => import('./auth/auth-callback/auth-callback.module').then(m => m.AuthCallbackPageModule)
  },
  {
    path: 'auth/endsessioncallback', loadChildren: () => import('./auth/end-session/end-session.module').then(m => m.EndSessionPageModule)
  },  {
    path: 'case-list',
    loadChildren: () => import('./case-list/case-list.module').then( m => m.CaseListPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }]
})
export class AppRoutingModule { }
