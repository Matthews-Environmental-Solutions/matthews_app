import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CaseStoreService } from '../case/case.store.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss']
})
export class SchedulePage implements OnInit, OnDestroy {
  showSearchbar: boolean;
  searchTerm: string;

  cases$ = this.caseStore.cases$;

  constructor(public toastController: ToastController, private caseStore: CaseStoreService) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.caseStore.getCases();
  }

  ngOnDestroy(): void {
  }

  deleteCase(id: number) {
    this.caseStore.deleteCase(id.toString());
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }
}
