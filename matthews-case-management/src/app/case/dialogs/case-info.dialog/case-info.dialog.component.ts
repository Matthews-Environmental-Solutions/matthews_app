import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, take } from 'rxjs';
import { Case } from 'src/app/models/case.model';

@Component({
  selector: 'app-case-info.dialog',
  templateUrl: './case-info.dialog.component.html',
  styleUrls: ['./case-info.dialog.component.scss']
})
export class CaseInfoDialogComponent {

  constructor(
    private router: Router,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<CaseInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Case,
  ){
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

  gotoCaseEdit(caseId: string) {
    this.router.navigate([`case/${caseId}`]);
    this.dialogRef.close();
  }

}
