import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-wfactory-snack-bar',
  templateUrl: './wfactory-snack-bar.component.html',
  styleUrls: ['./wfactory-snack-bar.component.scss']
})
export class WfactorySnackBarComponent {
  showMe: boolean = true;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<WfactorySnackBarComponent>) { }

  onCloseClick() {
    this.showMe = false;
    this.snackBarRef.dismiss();
  }
}
