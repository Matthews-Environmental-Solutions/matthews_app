import { Injectable } from "@angular/core";
import { UserSettingData } from "../models/user-setting.model";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserSettingService {
    public userSettings$: Observable<UserSettingData>;
    private userSettingBehaviorSubject = new BehaviorSubject<UserSettingData>(this.setDefaultUserSetting());

    constructor() {
        this.userSettings$ = this.userSettingBehaviorSubject;
    }

    setUserSetting(setting: UserSettingData): void {
        this.userSettingBehaviorSubject.next(setting);
    }

    getUserSettingLastValue(): UserSettingData {
        return this.userSettingBehaviorSubject.value;
    }

    setDefaultUserSetting(): UserSettingData {
        // let jsonSetting = localStorage.getItem(this.authService.loggedInUser.name);

        // if (!jsonSetting) {
        //     let defaultSetting = '{"username": "' + this.authService.loggedInUser.name + '", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24"}';
        //     localStorage.setItem(this.authService.loggedInUser.name, defaultSetting);
        //     jsonSetting = defaultSetting;
        // }



        //user setting
        // let userSetting = localStorage.getItem(this.authService.loggedInUser.name);
        // if(!userSetting){
        //     let defaultSetting = userSettingService.getUserSettingLastValue();
        //     defaultSetting.username = authService.loggedInUser.name;
        //     localStorage.setItem(authService.loggedInUser.name, JSON.stringify(defaultSetting));
        //     userSetting = JSON.stringify(defaultSetting);
        // }



        let jsonSetting = '{"username": "", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24"}';
        let userSetting = new UserSettingData();
        userSetting.copyInto(JSON.parse(jsonSetting));
        return userSetting;
    }

}