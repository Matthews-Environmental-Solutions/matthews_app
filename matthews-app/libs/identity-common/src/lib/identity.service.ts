import { WhoAmI } from './who-am-i';
import { Observable } from 'rxjs';
import { IdentityEvent } from './identity.event';

export abstract class IdentityService {
  abstract events: Observable<IdentityEvent<any>>;
  abstract whoAmI: Observable<WhoAmI | null>;
  abstract accessToken: Observable<string | null>;
  abstract logIn(): void;
  abstract logOut(): void;
  abstract loadWhoAmI(): void;
  abstract loadAccessToken(): void;

  abstract getInstantWhoAmI(): Observable<WhoAmI>;
  abstract getInstantAccessToken(): Observable<string>;
}
