import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaseListPage } from './case-list.page';

const routes: Routes = [
  {
    path: '',
    component: CaseListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseListPageRoutingModule {}
