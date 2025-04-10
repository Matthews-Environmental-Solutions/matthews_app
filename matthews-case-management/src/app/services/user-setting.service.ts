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
        let dateNow = this.formatDate(new Date());
        let jsonSetting = `{"username": "", "startDayOfWeek": "0", "language": "en", "timezone": "Europe/London", "timeformat": "24", "lastUsedFacilityId": "00000000-0000-0000-0000-000000000000", "lastUsedCalendarView":"byDay", "lastUsedSelectedDay":"${dateNow}"}`;
        let userSetting = new UserSettingData();
        userSetting.copyInto(JSON.parse(jsonSetting));
        return userSetting;
    }

    formatDate(date: Date): string {
        let month = '' + (date.getMonth() + 1);
        let day = '' + date.getDate();
        let year = date.getFullYear();
    
        if (month.length < 2)
          month = '0' + month;
        if (day.length < 2)
          day = '0' + day;
    
        return `${year}-${month}-${day}T12:00:00.000Z`;
      }
}