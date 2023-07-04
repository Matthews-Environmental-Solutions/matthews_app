import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseCalendarComponent } from './components/case-calendar/case-calendar.component';
import { CaseAddEditComponent } from './components/case-add-edit/case-add-edit.component';
import { CaseComponent } from './case.component';
import { FacilityComponent } from './components/facility/facility.component';
import { CaseAddEditGuard } from './case-add-edit-guard.service';

const routes: Routes = [
  {
    path: '', component: CaseComponent, children: [
      {
        path: '',
        component: CaseCalendarComponent
      },
      {
        path: 'case',
        component: CaseAddEditComponent,
        // canActivate: [CaseAddEditGuard]
      },
      {
        path: 'case/:id',
        component: CaseAddEditComponent,
      },
      {
        path: 'facility',
        component: FacilityComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaseRoutingModule { }
