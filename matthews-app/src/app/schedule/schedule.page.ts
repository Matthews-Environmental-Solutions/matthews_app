import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { ModalController } from '@ionic/angular';
import { Case } from '../case/case';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss']
})
export class SchedulePage implements OnInit {
  showSearchbar: boolean;
  searchTerm: string;
  selectedFacilityId: string;
  scheduleVm$ = this.caseStore.scheduleVm$;

  constructor(public toastController: ToastController, private caseStore: AppStoreService, public modalController: ModalController) { }

  ngOnInit() {
    this.showSearchbar = false;
  }

  deleteCase(selectedCase: Case) {
    this.caseStore.deleteCase(selectedCase);
  }

  selectedFacilityChanged($event){
    this.selectedFacilityId = $event.target.value;
    this.caseStore.getCases(this.selectedFacilityId);
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  presentModal(selectedCase?: Case) {
    this.caseStore.openCaseModal(selectedCase ?
      { ...selectedCase, facilityId: this.selectedFacilityId } :
      { facilityId : this.selectedFacilityId } as Case);
  }
}
