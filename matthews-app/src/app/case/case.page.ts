import { Component, Input, OnInit } from '@angular/core';
import { Case } from './case';
import { CaseStoreService } from './case.store.service';
import { ModalController } from '@ionic/angular';

export enum ContainerType {
  cardboard,
  fiberboard,
  hardwood,
  none,
}

export enum ContainerSize {
  child,
  standard,
  bariatric
}

@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {

  @Input() selectedCase: Case;

  genders: string[] = [
    'Female',
    'Male'
  ];

  containerTypes = ContainerType;
  containerSizes = ContainerSize;
  containerTypeKeys =  Object.keys(ContainerType).filter(x => (parseInt(x, 10) >= 0));
  containerSizeKeys = Object.keys(ContainerSize).filter(x => (parseInt(x, 10) >= 0));

  constructor(private caseStore: CaseStoreService, private modalCtrl: ModalController) { }

  ngOnInit() {

  }

  onSubmit() {
    if(!this.selectedCase.id) {
      this.caseStore.createCase(this.selectedCase);
    } else {
      this.caseStore.updateCase(this.selectedCase);
    }
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
