import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStoreService } from '../app.store.service';

@Component({
  selector: 'app-facility-details',
  templateUrl: './facility-details.page.html',
  styleUrls: ['./facility-details.page.scss'],
})
export class FacilityDetailsPage implements OnInit {

  $selectedFacility = this.appStore.selectedFacility$;
  constructor(private activatedRoute: ActivatedRoute, private appStore: AppStoreService) { }

  ngOnInit() {
    const facilityId = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('Selected Facility ID is: '+ facilityId);
  }

}
