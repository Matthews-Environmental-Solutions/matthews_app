import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { AppStoreService } from '../app.store.service';
import { Facility } from './facility';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.page.html',
  styleUrls: ['./facility.page.scss'],
})
export class FacilityPage implements OnInit {
  vm$ = this.appStoreService.vm$;
  showSearchbar: boolean;
  searchTerm: string;
  userId: string;

  constructor(private auth: AuthService,
              public toastController: ToastController,
              private appStoreService: AppStoreService,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.appStoreService.getFacilities();
    this.getUserInfo();
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  selectFacility(facility: Facility) {
    this.updateSelectedFacility(facility);
    this.navCtrl.navigateForward(['app/tabs/facility/device-list', facility.id]);
  }

  public async getUserInfo(): Promise<void> {
    await this.auth.loadUserInfo();
    console.log("User: " + JSON.stringify(this.auth.user$));
    this.auth.user$.subscribe(res => {
      this.appStoreService.getUserInfo(res.sub);
    });
  }

  revokeTokens() {
    this.auth.revokeTokens();
  }

  navigateToDetailsPage($event, facility: Facility) {
    $event.stopPropagation();
    this.updateSelectedFacility(facility);
    this.navCtrl.navigateForward(['app/tabs/facility', facility.id, 'facility-details']);
  }

  updateSelectedFacility(facility: Facility) {
    this.appStoreService.updateSelectedFacility(facility);
   }
}
