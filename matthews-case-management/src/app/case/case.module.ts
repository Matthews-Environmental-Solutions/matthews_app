import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CaseRoutingModule } from './case-routing.module';
import { CaseComponent } from './case.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { CaseCalendarComponent } from '../case/components/case-calendar/case-calendar.component';
import { CaseCalendarDailyComponent } from '../case/components/case-calendar-daily/case-calendar-daily.component';
import { CaseCalendarWeeklyComponent } from '../case/components/case-calendar-weekly/case-calendar-weekly.component';
import { UnscheduledCasesComponent } from '../case/components/unscheduled-cases/unscheduled-cases.component';
import { CaseAddEditComponent } from '../case/components/case-add-edit/case-add-edit.component';

import { MtxGridModule } from '@ng-matero/extensions/grid';
import { MtxSelectModule } from '@ng-matero/extensions/select';
import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { MtxNativeDatetimeModule } from '@ng-matero/extensions/core';
import { ProfileSettingDialogComponent } from './dialogs/profile-setting/profile-setting.dialog.component';
import { DatetimePipe } from '../pipes/datetime.pipe';
import { TranslateModule } from '@ngx-translate/core';

import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    CaseComponent,
    CaseCalendarComponent,
    CaseCalendarDailyComponent,
    CaseCalendarWeeklyComponent,
    UnscheduledCasesComponent,
    CaseAddEditComponent,
    ProfileSettingDialogComponent,
    DatetimePipe
  ],
  imports: [
    CommonModule,
    CaseRoutingModule,
    ReactiveFormsModule,

    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,

    MtxGridModule,
    MtxSelectModule,
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    FormsModule,

    TranslateModule,
    
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en' },
  ]
})
export class CaseModule {}
