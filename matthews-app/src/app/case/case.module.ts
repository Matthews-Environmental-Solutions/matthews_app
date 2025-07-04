import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CasePageRoutingModule } from './case-routing.module';

import { CasePage } from './case.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../pipes/pipes.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CasePageRoutingModule,
    TranslateModule,
    PipesModule.forRoot()
  ],
  declarations: [CasePage]
})
export class CasePageModule {}
