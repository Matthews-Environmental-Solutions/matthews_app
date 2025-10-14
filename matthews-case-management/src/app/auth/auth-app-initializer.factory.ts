import { TranslateService } from '@ngx-translate/core';
import { UserInfoAuth } from '../models/userinfo.model';
import { UserSettingService } from '../services/user-setting.service';
import { AuthService } from './auth.service'
import { UserSettingData } from '../models/user-setting.model';

export const languageList = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
];

export function authAppInitializerFactory(authService: AuthService, userSettingService: UserSettingService, translate: TranslateService): () => Promise<void> {
    return async () => {

        var replacer = function (this: any, key: any, value: any) {

            if (this[key] instanceof Date) {
                return this[key].toUTCString();
            }

            return value;
        }


        await authService.runInitialLoginSequence();

        if (!authService.hasValidToken()) {
            return;
        }

        await authService.loadProfile();

        //debugg
        console.log('Logged in user:', authService.loggedInUser);
        console.log('Storage key used for settings:', authService.loggedInUser?.name);


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

            // TIME ZONE??
            defaultSetting.timezone = 'UTC';
            
            let defaultSettingJson = JSON.stringify(defaultSetting, replacer);
            localStorage.setItem(authService.loggedInUser.name, defaultSettingJson);
            userSetting = defaultSettingJson;
        }

        userSettingService.setUserSetting(JSON.parse(userSetting));


        //translation
        const userLanguageCode: string = (JSON.parse(userSetting) as UserSettingData).language;

        const selectedLanguage = languageList
            .find((language) => language.code === userLanguageCode)?.label.toString();

        if (selectedLanguage) {
            translate.use(userLanguageCode);
        }

        const currentLanguage = translate.currentLang;

    }

}