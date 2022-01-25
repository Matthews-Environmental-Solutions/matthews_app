import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'ionic-appauth';
import { AppStoreService } from '../app.store.service';
import { FacilityService } from './facility.service';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.page.html',
  styleUrls: ['./facility.page.scss'],
})
export class FacilityPage implements OnInit {
  vm$ = this.appStoreService.vm$;
  facilities$ = this.appStoreService.facilities$;
  userInfo$ = this.appStoreService.userInfo$;
  showSearchbar: boolean;
  searchTerm: string;
  userId: string;

  constructor(private auth: AuthService, public toastController: ToastController, private appStoreService: AppStoreService) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.appStoreService.getFacilities();

    this.getUserInfo();
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  public async getUserInfo(): Promise<void> {
    await this.auth.loadUserInfo();

    this.auth.user$.subscribe(res => {
      this.userId = res.sub;
    });

    this.appStoreService.getUserInfo(this.userId);
  }

  revokeTokens() {
    this.auth.revokeTokens();
  }
}
