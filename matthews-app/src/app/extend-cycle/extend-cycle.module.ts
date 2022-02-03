import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExtendCyclePageRoutingModule } from './extend-cycle-routing.module';

import { ExtendCyclePage } from './extend-cycle.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExtendCyclePageRoutingModule,
    TranslateModule
  ],
  declarations: [ExtendCyclePage]
})
export class ExtendCyclePageModule {}
