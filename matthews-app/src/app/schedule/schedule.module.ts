import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedulePageRoutingModule } from './schedule-routing.module';

import { SchedulePage } from './schedule.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { LongPressModule } from 'ionic-long-press';
import { TranslateModule } from '@ngx-translate/core';
import { EnumFormatPipe } from '../pipes/enum-format.pipe';
import { PipesModule } from '../pipes/pipes.module';
import { MatIconModule} from '@angular/material/icon';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatIconModule,
    SchedulePageRoutingModule,
    Ng2SearchPipeModule,
    LongPressModule,
    TranslateModule,
    PipesModule.forRoot()
  ],
  declarations: [SchedulePage]
})
export class SchedulePageModule {}
