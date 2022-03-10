import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../core/auth-guard.service';
import { TabsPagePage } from './tabs-page.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPagePage,
    children: [
      {
        path: 'schedule',
        loadChildren: () => import('../schedule/schedule.module').then( m => m.SchedulePageModule)
      },
      {
        path: 'facility',
        children: [
          {
            path: '',
            canActivate: [AuthGuardService],
            loadChildren: () => import('../facility/facility.module').then( m => m.FacilityPageModule)
          },
          {
            path: ':id/facility-details',
            loadChildren: () => import('../facility-details/facility-details.module').then( m => m.FacilityDetailsPageModule)
          },
          {
            path: 'device-list/:id',
            loadChildren: () => import('../device-list/device-list.module').then( m => m.DeviceListPageModule)
          },
          {

            path: 'device/:id',
            loadChildren: () => import('../cremation-process/cremation-process.module').then( m => m.CremationProcessPageModule)
          },
          {
            path: 'device/device-details/:id/:name',
            loadChildren: () => import('../device-details/device-details.module').then( m => m.DeviceDetailsPageModule)
          }
        ],
      },
      {
        path: 'device',
        loadChildren: () => import('../cremation-process/cremation-process.module').then( m => m.CremationProcessPageModule)
      },
      {
        path: '',
        redirectTo: 'facility',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/app/tabs/facility',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPagePageRoutingModule {}
