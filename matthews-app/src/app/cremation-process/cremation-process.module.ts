import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CremationProcessPageRoutingModule } from './cremation-process-routing.module';
import { CremationProcessPage } from './cremation-process.page';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CremationProcessPageRoutingModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslateModule
  ],
  declarations: [CremationProcessPage]
})
export class CremationProcessPageModule {}
