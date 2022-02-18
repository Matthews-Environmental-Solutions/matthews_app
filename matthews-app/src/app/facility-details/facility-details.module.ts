import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityDetailsPageRoutingModule } from './facility-details-routing.module';

import { FacilityDetailsPage } from './facility-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityDetailsPageRoutingModule
  ],
  declarations: [FacilityDetailsPage]
})
export class FacilityDetailsPageModule {}
