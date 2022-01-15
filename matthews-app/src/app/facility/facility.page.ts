import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AppStoreService } from '../app.store.service';
import { IFacility } from './facility';
import { FacilityService } from './facility.service';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.page.html',
  styleUrls: ['./facility.page.scss'],
})
export class FacilityPage implements OnInit {
  facilities$ = this.appStoreService.facilities$;
  facilities: IFacility[];
  showSearchbar: boolean;
  searchTerm: string;

  constructor(public toastController: ToastController, private appStoreService: AppStoreService) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.appStoreService.getFacilities();
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }
}
