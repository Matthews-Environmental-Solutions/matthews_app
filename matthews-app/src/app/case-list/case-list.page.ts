/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';
import { CaseStatuses } from '../core/enums';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.page.html',
  styleUrls: ['./case-list.page.scss'],
})
export class CaseListPage implements OnInit {
  @Input() selectedDeviceId: string;
  showSearchbar: boolean;
  searchTerm: string;
  caseStatuses = CaseStatuses;
  deviceCases$ = this.appStore.deviceCases$.pipe(
    map(cases => cases.sort((a, b) => new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()))
  );

  constructor(public toastController: ToastController, private appStore: AppStoreService, public modalController: ModalController) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.appStore.getCasesForDevice(this.selectedDeviceId,);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  getSelectedCase(selectedCase: Case) {
    this.appStore.updateSelectedCase(selectedCase);
    this.appStore.updateSelectedCaseId(selectedCase.id);
    this.close(selectedCase);
  }

  async close(selectedCase?: Case) {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss({ selectedCase });
    }
  }
  
}
