import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription, skip, tap } from 'rxjs';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { Facility } from 'src/app/models/facility.model';
import { FacilityStatusService } from 'src/app/services/facility-status.service';
import { I4connectedService } from 'src/app/services/i4connected.service';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.scss']
})
export class FacilityComponent implements OnInit {
  
  panelOpenState = false;
  title: string = 'facilityStatuses';
  searchTerm = '';
  facilitiesDataSource: MatTableDataSource<any> = new MatTableDataSource<Facility>();
  facilities: Facility[] = [];
  selectedFacility: Facility = {id: '00000000-0000-0000-0000-000000000000', name: '', icon: ''};
  facilityStatuses!: FacilityStatus[];

  private subs = new Subscription();

  constructor(private i4connectedService: I4connectedService, private facilityStatusService: FacilityStatusService, private router: Router) {
    this.subs.add(this.i4connectedService.getSites().subscribe(data => {
      this.facilitiesDataSource = new MatTableDataSource<Facility>(data);
      this.facilities = this.facilitiesDataSource.filteredData;
    }));
  }

  filterFacilities(searchTerm: string) {
    this.facilitiesDataSource.filter = searchTerm.trim().toLocaleLowerCase();
    const filterValue = searchTerm;
    this.facilitiesDataSource.filter = filterValue.trim().toLowerCase();
    this.facilities = this.facilitiesDataSource.filteredData;
  }

  getDataOnOpen(id: string){
    this.i4connectedService.getSite(id).subscribe(data => {
      this.selectedFacility = data;
      this.facilityStatusService.getAllStatusesByFacility(this.selectedFacility.id).pipe(
        tap( results => results.sort((a, b) => {
          return a.statusCode < b.statusCode ? -1 : 1;
        }))
      ).subscribe(statuses => {
        this.facilityStatuses = statuses;
        console.log('facilityStatuses', this.facilityStatuses);
      });
    });
    
  }

  nextStep(){

  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  backToCalendar() {
    this.router.navigate([``]);
  }
}
