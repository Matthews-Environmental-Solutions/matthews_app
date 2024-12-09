import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {
    this.requestPermission();
  }

  async requestPermission() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  }

  async scheduleNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "You have successfully selected a facility",
          body: "This is a test notification",
          id: 1,
          schedule: { at: new Date(Date.now() + 5000) } // 5 seconds from now
        }
      ]
    });
  }
}
