import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { LandingPageRoutingModule } from './landing-routing.module';

import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LandingPage } from './landing.page';

const routes: Routes = [
  {
    path: '',
    component: LandingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LandingPageRoutingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LandingPage]
})
export class LandingPageModule {}
