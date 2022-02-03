import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPagePageRoutingModule } from './tabs-page-routing.module';

import { TabsPagePage } from './tabs-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPagePageRoutingModule,
    TranslateModule
  ],
  declarations: [TabsPagePage]
})
export class TabsPagePageModule {}
