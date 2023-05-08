import { Injectable } from "@angular/core";
import { UserSettingData } from "../models/user-setting.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserSettingService {

    private userSettingBehaviorSubject = new BehaviorSubject<UserSettingData>(this.setDefaultUserSetting());
    private userSetting!: UserSettingData;

    constructor() { }

    setUserSetting(setting: UserSettingData): void {
        this.userSetting = setting;
        this.userSettingBehaviorSubject.next(setting);
    }

    getUserSetting() {
        return this.userSettingBehaviorSubject.asObservable();
    }

    getUserSettingAsObject(): UserSettingData {
        return this.userSetting;
    }

    setDefaultUserSetting(): UserSettingData {
        let jsonSetting = JSON.parse('{"username": "", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24"}');
        let userSetting = new UserSettingData();
        userSetting.copyInto(jsonSetting);
        return userSetting;
    }

}