import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseListPageRoutingModule } from './case-list-routing.module';

import { CaseListPage } from './case-list.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { LongPressModule } from 'ionic-long-press';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseListPageRoutingModule,
    Ng2SearchPipeModule,
    LongPressModule,
    TranslateModule
  ],
  declarations: [CaseListPage]
})
export class CaseListPageModule {}
