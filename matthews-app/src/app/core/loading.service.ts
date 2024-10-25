import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading = false;

  constructor(public loadingController: LoadingController) {}

  async present() {
    if (!this.isLoading) { // Only create if no loading overlay exists
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      if (!this.isLoading) {
        await loading.dismiss();
      }
    }
  }

  async dismiss() {
    if (this.isLoading) {
      this.isLoading = false;
      const loading = await this.loadingController.getTop();
      if (loading) {
        await loading.dismiss();
      }
    }
  }
}
