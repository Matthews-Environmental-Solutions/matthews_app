import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { AppStoreService } from '../app.store.service';
import { Facility } from './facility';
import { NotificationService } from '../core/notification.service';
import { DemoService } from '../core/demo.service';

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
  demoMode: boolean;
  showingDemoToast: boolean = false;

  constructor(private auth: AuthService,
    public toastController: ToastController,
    private appStoreService: AppStoreService,
    private navCtrl: NavController,
    public demoService: DemoService) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.appStoreService.getFacilities();
    this.getUserInfo();
    this.demoService.IsUseDemoEntitiesOnly().then((isDemo) => {
      this.appStoreService.updateDemoMode(isDemo.useDemoEntitiesOnly);
      console.log("DEMO:", isDemo.useDemoEntitiesOnly);
    });

    this.appStoreService.demoMode$.subscribe((value) => {
      this.demoMode = value;
    });
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  async showDemoInfo() {
    const toast = await this.toastController.create({
      message: 'Devices with "DEMO" in their name (alias) will receive an updated list of 20 cases via MQTT whenever you make any changes to their Cases. You can still add, edit, and delete cases in all facilities, but keep in mind that only DEMO devices will be updated with the Case list.',
      duration: 4000,
      position: 'top', // or 'bottom', 'middle'
      color: 'warning',
    });
    toast.present();
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
    this.appStoreService.setSelectedFacility(facility);
  }
}
