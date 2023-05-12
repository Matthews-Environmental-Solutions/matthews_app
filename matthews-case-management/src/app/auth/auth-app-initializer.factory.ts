import { UserInfoAuth } from '../models/userinfo.model';
import { UserSettingService } from '../services/user-setting.service';
import { AuthService } from './auth.service'

export function authAppInitializerFactory(authService: AuthService, userSettingService: UserSettingService): () => Promise<void> {
    return async () => {
        await authService.runInitialLoginSequence();

        if (!authService.hasValidToken()) {
            return;
        }

        await authService.loadProfile();

        //logged in user
        let userinfoString = localStorage.getItem('id_token_claims_obj');
        let jsonLoggedInUser = JSON.parse(userinfoString ? userinfoString : '');

        authService.loggedInUser = new UserInfoAuth();
        authService.loggedInUser.copyInto(jsonLoggedInUser);


        //user setting
        let userSetting = localStorage.getItem(authService.loggedInUser.name);
        if (!userSetting) {
            let defaultSetting = userSettingService.getUserSettingLastValue();
            defaultSetting.username = authService.loggedInUser.name;

            let defaultSettingJson = JSON.stringify(defaultSetting);
            localStorage.setItem(authService.loggedInUser.name, defaultSettingJson);
            userSetting = defaultSettingJson;
        }

        userSettingService.setUserSetting(JSON.parse(userSetting));

        // return Promise.resolve(authService.loggedInUser);

    }
}