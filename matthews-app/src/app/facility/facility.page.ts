import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IFacility } from './facility';
import { FacilityService } from './facility.service';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.page.html',
  styleUrls: ['./facility.page.scss'],
})
export class FacilityPage implements OnInit {
  facilities: IFacility[];
  showSearchbar: boolean;
  searchTerm: string;
  sub: Subscription;

  constructor(public toastController: ToastController, private facilityService: FacilityService) { }

  ngOnInit() {
    this.showSearchbar = false;
    this.sub = this.facilityService.getFacilities().subscribe({
      next: facilities => {
        this.facilities = facilities;
      }
    });
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  ngOnDestroy(): void {
    //this.sub.unsubscribe();
  }

}
