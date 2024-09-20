import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseListPageRoutingModule } from './case-list-routing.module';

import { CaseListPage } from './case-list.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseListPageRoutingModule,
    Ng2SearchPipeModule,
    TranslateModule,
    PipesModule
  ],
  declarations: [CaseListPage]
})
export class CaseListPageModule {}
