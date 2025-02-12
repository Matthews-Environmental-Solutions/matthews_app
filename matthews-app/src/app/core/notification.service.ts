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

  async scheduleNotification(title: string = "Alarm Alert", body: string = "An event has occurred.") {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: new Date().getTime(),  // unique ID for each notification
          schedule: { at: new Date(Date.now() + 1000) } // 1 second from now
        }
      ]
    });
  }
}

