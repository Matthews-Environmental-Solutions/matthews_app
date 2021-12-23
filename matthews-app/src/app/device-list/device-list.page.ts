import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IDevice } from '../device-details/device';
import { IFacility } from '../facility/facility';
import { FacilityService } from '../facility/facility.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.page.html',
  styleUrls: ['./device-list.page.scss'],
})
export class DeviceListPage implements OnInit {

  facility$: Observable<IFacility>;
  devices: IDevice[]
  showSearchbar: boolean;
  searchTerm: string;
  sub: Subscription;

  constructor(private route: ActivatedRoute, private facilityService: FacilityService) { }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');
    if(id) {
      // this.facilityService.getFacility(id).subscribe(result => {
      //   this.facility = result;
      //   this.devices = this.facility.devices;
      //   console.log(this.facility);
      // });
      this.facility$ = this.facilityService.getFacility(id);
    }
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
