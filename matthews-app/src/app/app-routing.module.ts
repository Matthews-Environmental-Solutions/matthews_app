import { NgModule } from '@angular/core';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { AuthGuardService } from './core/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full'
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
    path: 'landing',
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'logout',
    loadChildren: () => import('./logout/logout.module').then( m => m.LogoutPageModule)
  },
  {
    path: 'authorizationcallback',
    loadChildren: () => import('./auth/auth-callback/auth-callback.module').then(m => m.AuthCallbackPageModule)
  },
  {
    path: 'endsessioncallback', loadChildren: () => import('./auth/end-session/end-session.module').then(m => m.EndSessionPageModule)
  },
  {
    path: 'case-list',
    loadChildren: () => import('./case-list/case-list.module').then( m => m.CaseListPageModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./tabs-page/tabs-page.module').then( m => m.TabsPagePageModule)
  },
  {
    path: 'extend-cycle',
    loadChildren: () => import('./extend-cycle/extend-cycle.module').then( m => m.ExtendCyclePageModule)
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
