import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityDetailsPage } from './facility-details.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityDetailsPageRoutingModule {}
