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
        let jsonSetting = JSON.parse('{"username": "", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24"}');
        let userSetting = new UserSettingData();
        userSetting.copyInto(jsonSetting);
        return userSetting;
    }

}