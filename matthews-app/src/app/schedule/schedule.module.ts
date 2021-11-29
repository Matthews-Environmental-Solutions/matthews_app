import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedulePageRoutingModule } from './schedule-routing.module';

import { SchedulePage } from './schedule.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { LongPressModule } from 'ionic-long-press';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulePageRoutingModule,
    Ng2SearchPipeModule,
    LongPressModule
  ],
  declarations: [SchedulePage]
})
export class SchedulePageModule {}
