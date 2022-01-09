import { Platform } from '@ionic/angular';
import { CapacitorStorage, CordovaSecureStorage } from '@matthews-app/ionic-appauth';

export let storageFactory = (platform: Platform) => {
  return platform.is('capacitor')
    ? new CapacitorStorage()
    : new CordovaSecureStorage();
};
