import { UserInfoAuth } from '../models/userinfo.model';
import { UserSettingService } from '../services/user-setting.service';
import { AuthService } from './auth.service'

export function authAppInitializerFactory(authService: AuthService, userSettingService: UserSettingService): () => Promise<void> {
    return () => authService.runInitialLoginSequence()
        .catch(er => {
            console.log('GRESKA', er);
        })
        .then(res => {

            if (authService.isAuthenticatedSubject$.value) {
                authService.loadProfile().then(() => {

                    let userinfoString = localStorage.getItem('id_token_claims_obj');
                    let jsonLoggedInUser = JSON.parse(userinfoString ? userinfoString : '');

                    authService.loggedInUser = new UserInfoAuth();
                    authService.loggedInUser.copyInto(jsonLoggedInUser);

                    return Promise.resolve(authService.loggedInUser);

                })
                    .catch(er => {
                        console.log('loadProfile error', er);
                    })
                    .then(loggedInUser => {
                        let user = userSettingService.getUserSettingLastValue();
                    })
            }


            // .... logika

        });
}