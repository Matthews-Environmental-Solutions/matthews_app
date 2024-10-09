import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription, skip, tap } from 'rxjs';
import { FacilityStatus } from 'src/app/models/facility-status.model';
import { Facility } from 'src/app/models/facility.model';
import { FacilityStatusService } from 'src/app/services/facility-status.service';
import { I4connectedService } from 'src/app/services/i4connected.service';
import { FacilityStatusDialogComponent } from '../../dialogs/facility-status/facility-status.dialog.component';
import { WfactorySnackBarService } from 'src/app/components/wfactory-snack-bar/wfactory-snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { DeleteFacilityStatusDialogComponent } from '../../dialogs/delete-facility-status/delete-facility-status.dialog.component';
import { StateService } from 'src/app/services/states.service';
import { CaseService } from 'src/app/services/cases.service';
import { CaseStatusDto } from 'src/app/models/case-status-dto.model';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.scss']
})
export class FacilityComponent implements OnInit {

  private GUID_EMPTY: string = '00000000-0000-0000-0000-000000000000';
  panelOpenState = false;
  title: string = 'facilityStatuses';
  searchTerm = '';
  facilitiesDataSource: MatTableDataSource<any> = new MatTableDataSource<Facility>();
  facilities: Facility[] = [];
  selectedFacility: Facility = { id: this.GUID_EMPTY, name: '', icon: '' };
  facilityStatuses!: FacilityStatus[];
  selectedStatusForEdit: FacilityStatus = new FacilityStatus();
  generalCaseStatuses: CaseStatusDto[] = [];

  private subs = new Subscription();

  constructor(
    private i4connectedService: I4connectedService,
    private facilityStatusService: FacilityStatusService,
    private router: Router,
    private _shackBar: WfactorySnackBarService,
    private translate: TranslateService,
    private stateService: StateService,
    private caseService: CaseService,
    public dialog: MatDialog) {
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

  getDataOnOpen(id: string) {
    this.i4connectedService.getSite(id).subscribe(data => {
      this.selectedFacility = data;
      this.facilityStatusService.getAllStatusesByFacility(this.selectedFacility.id)
      .subscribe(statuses => {
        this.facilityStatuses = statuses;
        console.log('facilityStatuses', this.facilityStatuses);
      });
    });

  }

  addNewStatus() {
    let newStatus = new FacilityStatus();
    newStatus.facilityId = this.selectedFacility.id;
    const dialogRef = this.dialog.open(FacilityStatusDialogComponent, {
      data: newStatus,
      width: '600px'
    });

    this.manageResponse(dialogRef);
  }

  ngOnInit(): void {
    console.log(this.stateService.getUserDetails());
    this.caseService.getCaseStatuses().subscribe(statuses => this.generalCaseStatuses = statuses);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  translateCaseStatus(statusValue: number): string {
    var status = this.generalCaseStatuses.find(gs => gs.value == statusValue);
    var name = status == null ? '' : status.name;
    return this.translate.instant(name);
  }

  backToCalendar() {
    this.router.navigate([``]);
  }

  deleteStatus(fStatus: FacilityStatus) {
    const dialogRef = this.dialog.open(DeleteFacilityStatusDialogComponent);
    dialogRef.afterClosed().subscribe(
      {
        next: result => {
          if (result == true) {
            this.facilityStatusService.delete(fStatus).subscribe({
              next: result => {
                this._shackBar.showNotification(this.translate.instant('facilityStatusSuccessfullyDeleted'), 'success');
                this.getDataOnOpen(this.selectedFacility.id);
              },
              error: err => {
                if(err.includes("409")){
                  this._shackBar.showNotification(this.translate.instant('facilityStatusIsInUsageNotDeleted'), 'warning');
                }else{
                  this._shackBar.showNotification(this.translate.instant('facilityStatusNotDeleted'), 'error');
                }
                
              }
            });
          }
        }
      }
    );


  }

  editStatus(fStatus: FacilityStatus): void {
    const dialogRef = this.dialog.open(FacilityStatusDialogComponent, {
      data: fStatus,
      width: '600px'
    });

    this.manageResponse(dialogRef);

    this.selectedStatusForEdit = fStatus;
  }

  manageResponse(dialogRef: MatDialogRef<FacilityStatusDialogComponent>) {
    dialogRef.afterClosed().subscribe(
      {
        next: result => {
          if (result) {
            console.log('The dialog was closed', result);

            if (result.id == this.GUID_EMPTY) {
              this.facilityStatusService.save(result).subscribe({
                next: data => {
                  this._shackBar.showNotification(this.translate.instant('facilityStatusSuccessfullySaved'), 'success');
                  this.getDataOnOpen(this.selectedFacility.id);
                },
                error: errData => {
                  this._shackBar.showNotification(this.translate.instant('facilityStatusNotSaved') + ' ' + errData, 'error');
                }
              })
            } else {
              this.facilityStatusService.update(result).subscribe({
                next: data => {
                  this._shackBar.showNotification(this.translate.instant('facilityStatusSuccessfullySaved'), 'success');
                  this.getDataOnOpen(this.selectedFacility.id);
                },
                error: errData => {
                  this._shackBar.showNotification(this.translate.instant('facilityStatusNotSaved') + ' ' + errData, 'error');
                }
              })
            }


          }
        },
        error: err => {
          this._shackBar.showNotification(this.translate.instant('facilityStatusNotSaved') + ' ' + err, 'error');
        }
      });
  }

}
