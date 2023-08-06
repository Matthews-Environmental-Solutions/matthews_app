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
        let jsonSetting = `{"username": "", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24", "lastUsedFacilityId": "00000000-0000-0000-0000-000000000000", "lastUsedCalendarView":"byDay", "lastUsedSelectedDay":"${Date.now()}"}`;
        let userSetting = new UserSettingData();
        userSetting.copyInto(JSON.parse(jsonSetting));
        return userSetting;
    }

}