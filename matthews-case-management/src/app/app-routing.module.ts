import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './auth/auth-guard.service';


const routes: Routes = [
    {
    path: '',
    loadChildren: () => import('./case/case.module').then((m) => m.CaseModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'welcome',
    component: WelcomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
