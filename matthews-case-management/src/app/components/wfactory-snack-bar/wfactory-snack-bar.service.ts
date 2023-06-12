import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { WfactorySnackBarComponent } from "./wfactory-snack-bar.component";
import { TranslateService } from "@ngx-translate/core";


@Injectable({
    providedIn: 'root'
})

export class WfactorySnackBarService {
    
    constructor(private snackBar: MatSnackBar, private translate: TranslateService) { }

    showNotification(displayMessage: string, messageType: 'error' | 'success' | 'warning') {
        const data = {
            titleText: this.translate.instant(messageType),
            message: displayMessage,
            type: messageType,
            icon: messageType === 'success' ? 'done' : messageType === 'warning' ? 'warning' : 'error'
        };

        if (messageType === 'success') {
            this.snackBar.openFromComponent(WfactorySnackBarComponent, {
                data,
                horizontalPosition: "left",
                verticalPosition: "bottom",
                duration: 5000,
            });
        } else if (messageType === 'error'){
            this.snackBar.openFromComponent(WfactorySnackBarComponent, {
                data,
                horizontalPosition: "left",
                verticalPosition: "bottom",
            });
        } else {
            this.snackBar.openFromComponent(WfactorySnackBarComponent, {
                data,
                horizontalPosition: "left",
                verticalPosition: "bottom",
                duration: 10000,
            });
        }
    }
}