import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';
import { CaseStatuses } from '../core/enums';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.page.html',
  styleUrls: ['./case-list.page.scss'],
})
export class CaseListPage implements OnInit {
  @Input() selectedFacilityId: string;
  showSearchbar: boolean;
  searchTerm: string;
  caseStatuses = CaseStatuses;
  deviceCases$ = this.appStore.deviceCases$;

  constructor(public toastController: ToastController, private appStore: AppStoreService, public modalController: ModalController) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.appStore.getCasesFilteredByDevice(this.selectedFacilityId,);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  getSelectedCase(selectedCase: Case) {
    this.appStore.updateSelectedCase(selectedCase);
    this.close();
  }

  close() {
    this.modalController.dismiss();
  }
}
