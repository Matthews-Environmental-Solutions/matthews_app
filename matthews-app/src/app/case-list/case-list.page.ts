import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { Case } from '../case/case';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.page.html',
  styleUrls: ['./case-list.page.scss'],
})
export class CaseListPage implements OnInit {
  showSearchbar: boolean;
  searchTerm: string;

  cases$ = this.caseStore.cases$;

  constructor(public toastController: ToastController, private caseStore: AppStoreService, public modalController: ModalController) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.caseStore.getCases();
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  getSelectedCase(selectedCase: Case) {
    this.caseStore.updateSelectedCases(selectedCase);
    this.modalController.dismiss();
  }
}
