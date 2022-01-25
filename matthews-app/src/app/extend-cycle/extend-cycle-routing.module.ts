import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExtendCyclePage } from './extend-cycle.page';

const routes: Routes = [
  {
    path: '',
    component: ExtendCyclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtendCyclePageRoutingModule {}
