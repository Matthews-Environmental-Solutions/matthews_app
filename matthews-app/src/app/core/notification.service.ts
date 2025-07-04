import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {
    this.requestPermission();
    this.createNotificationChannel();
  }

  async requestPermission() {
    const permission = await LocalNotifications.requestPermissions();
    console.log(permission); // Log permission object
    if (permission.display === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  }

  async scheduleNotification(title: string, body: string) {
    const platform = Capacitor.getPlatform();
    await this.createNotificationChannel(); // Ensure channel is ready
    if (platform === 'ios' || platform === 'android') {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: Math.floor(Math.random() * 2147483647),  // unique ID for each notification
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          channelId: 'alerts'
        }
      ]
    });} else {
      console.warn('Local notifications are not supported on the web.');
    }
  }

  async createNotificationChannel() {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Skipping createNotificationChannel: Not supported on web.');
      return;
    }
  
    console.log('Creating notification channel');
    await LocalNotifications.createChannel({
      id: 'alerts',
      name: 'Alerts',
      importance: 5, // High importance
      visibility: 1, // Public visibility
      sound: 'default',
    });
  }  

  async testNotification() {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Test Notification',
            body: 'This is a test notification',
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
            channelId: 'alerts'
          }
        ]
      });
    } else {
      alert('Simulated notification: This is a test notification');
    }
  }
}

