import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
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

  constructor(public toastController: ToastController, private facilityService: FacilityService) { }

  ngOnInit() {
    this.showSearchbar = false;

    this.facilityService.getFacilities().then(
      (response: IFacility[]) => {
        this.facilities = response;
        console.log("FACILITIES =====> " + JSON.stringify(this.facilities));
      }
    ).catch((error: any) => {
      console.log(error);
    });
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }
}
