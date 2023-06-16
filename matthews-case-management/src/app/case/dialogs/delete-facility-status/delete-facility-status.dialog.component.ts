import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-facility-status.dialog',
  templateUrl: './delete-facility-status.dialog.component.html',
  styleUrls: ['./delete-facility-status.dialog.component.scss']
})
export class DeleteFacilityStatusDialogComponent {
  title!: string;

  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<DeleteFacilityStatusDialogComponent>) {
    this.title = this.translate.instant('deleteStatusConfirmation');
  }

  yes() {
    this.dialogRef.close(true);
  }

  no() {
    this.dialogRef.close(false);
  }
}
