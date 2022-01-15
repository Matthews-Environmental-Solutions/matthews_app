import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthActions, AuthService, IAuthAction } from 'ionic-appauth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit, OnDestroy {
  user$ = this.auth.user$;
  events$ = this.auth.events$;
  sub: Subscription;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController) { }

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) => this.onSignOutSuccess(action));
    this.signOut();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private onSignOutSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignOutSuccess) {
      this.navCtrl.navigateRoot('landing');
    }
  }

  public signOut() {
    this.auth.signOut();
  }

}
