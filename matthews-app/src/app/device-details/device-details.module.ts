import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeviceDetailsPageRoutingModule } from './device-details-routing.module';

import { DeviceDetailsPage } from './device-details.page';
import { MatStepperModule } from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DeviceDetailsPageRoutingModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [DeviceDetailsPage]
})
export class DeviceDetailsPageModule {}
