import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { IAuthAction, AuthActions, AuthService } from 'ionic-appauth';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, OnDestroy {
  events$ = this.auth.events$;
  sub: Subscription;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) => this.onSignInSuccess(action));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private onSignInSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignInSuccess) {
      this.navCtrl.navigateRoot('facility');
    }
  }

  public signIn() {
    this.auth.signIn();
  }

}
