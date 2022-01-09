import { AuthBrowser } from '../auth-browser';
import { Plugins } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export class CapacitorBrowser extends AuthBrowser {
  public closeWindow(): void | Promise<void> {
    if (!Plugins.Browser) throw new Error('Capacitor Browser Is Undefined!');

    Plugins.AuthBrowser.close();
  }

  public async showWindow(
    url: string,
    callbackUrl?: string
  ): Promise<string | undefined> {

    if (!Plugins.AuthBrowser) throw new Error('Capacitor Browser Is Undefined!');

    Plugins.AuthBrowser.open(await Browser.open({ url: url, windowName: '_self' }));

    return;
  }
}
