import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, take } from 'rxjs';
import { Case } from 'src/app/models/case.model';

@Component({
  selector: 'app-case-details.dialog',
  templateUrl: './case-details.dialog.component.html',
  styleUrls: ['./case-details.dialog.component.scss']
})
export class CaseDetailsDialogComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<CaseDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Case,
  ){
  }

  ngOnInit(): void {
    console.log('data', this.data);
  }

  onNoClick(): void {
    this.dialogRef.close(); 
  }

  getStatusDescription(status: number): Observable<string> {
    switch (status) {
      case 1:
        return this.translate.get('cremationComplete').pipe(take(1));
      case 2:
        return this.translate.get('inProgress').pipe(take(1));
      case 3:
        return this.translate.get('readyToCremate').pipe(take(1));
      case 4:
        return this.translate.get('waitingForPermit').pipe(take(1));
      default:
        return of('');
    }
  }
}
