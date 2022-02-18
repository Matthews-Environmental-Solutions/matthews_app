import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CremationProcessPage } from './cremation-process.page';

const routes: Routes = [
  {
    path: '',
    component: CremationProcessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CremationProcessPageRoutingModule {}
