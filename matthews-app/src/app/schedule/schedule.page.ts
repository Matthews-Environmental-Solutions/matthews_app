import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { ModalController } from '@ionic/angular';
import { CasePage } from '../case/case.page';
import { Case } from '../case/case';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss']
})
export class SchedulePage implements OnInit {
  showSearchbar: boolean;
  searchTerm: string;

  cases$ = this.caseStore.cases$;

  constructor(public toastController: ToastController, private caseStore: AppStoreService, public modalController: ModalController) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.caseStore.getCases();
  }

  deleteCase(id: number) {
    this.caseStore.deleteCase(id.toString());
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  presentModal(selectedCase?: Case) {
    this.caseStore.openCaseModal(selectedCase ? selectedCase : new Case());
  }
}
