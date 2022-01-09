export abstract class AuthBrowser {
  protected onCloseFunction: Function = () => {};

  abstract showWindow(
    url: string,
    callbackUrl?: string
  ): string | undefined | Promise<string | undefined>;
  abstract closeWindow(): void | Promise<void>;

  addCloseBrowserEvent(closeBrowserEvent: Function) {
    this.onCloseFunction = closeBrowserEvent;
  }
}

export class DefaultBrowser extends AuthBrowser {
  public showWindow(url: string): string | undefined {
    window.open(url, '_self');
    return;
  }

  public closeWindow(): void {}
}
