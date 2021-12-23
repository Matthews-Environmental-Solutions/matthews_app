import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
