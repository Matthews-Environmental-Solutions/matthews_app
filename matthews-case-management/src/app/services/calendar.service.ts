import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { getWeek, startOfWeek, addDays, getDate, getMonth } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { listTimeZones } from 'timezone-support';
import { UserSettingService } from "./user-setting.service";

@Injectable({
    providedIn: 'root'
})
export class CalendarService {


    constructor(private translate: TranslateService, private userSettingService: UserSettingService) {
    }

    getWeekNumberByDate(date: Date): number {
        const result = getWeek(date, {
            weekStartsOn: 1
        });
        return result;
    }

    /**
     * 
     * @param date 
     * @param startDayOfWeek is number.   The 0 is for Sunday, while 1 is for Monday 
     * @returns 
     */
    getStartDayOfTheWeekForGivenDate(date: Date, startDayOfWeek: 0 | 1) {
        const day = startOfWeek(date, {
            weekStartsOn: startDayOfWeek
        });
        return day;
    }

    getWeekForGivenDate(date: Date, startDayOfWeek: 0 | 1): Date[] {
        let days: Date[] = [];
        let firstDayOfTheWeek = this.getStartDayOfTheWeekForGivenDate(date, startDayOfWeek);

        days.push(firstDayOfTheWeek);
        days.push(addDays(firstDayOfTheWeek, 1));
        days.push(addDays(firstDayOfTheWeek, 2));
        days.push(addDays(firstDayOfTheWeek, 3));
        days.push(addDays(firstDayOfTheWeek, 4));
        days.push(addDays(firstDayOfTheWeek, 5));
        days.push(addDays(firstDayOfTheWeek, 6));

        return days;
    }

    addDays(date: Date, numberOfDaysToAdd: number): Date {
        return addDays(date, numberOfDaysToAdd);
    }

    getDateAndMonth(date: Date): string {
        let currentLang = this.translate.store.currentLang;
        let monthName = date.toLocaleString(currentLang, { month: 'short' });
        return `${getDate(date).toString()} ${monthName}`;
    }

    getAllTimeZones(): string[] {
        return listTimeZones();
    }

    getDateInUserProfilesTimezone(d: Date | string): Date {
        var setting = this.userSettingService.getUserSettingLastValue();

        // if (typeof d === 'string') {
        //     return new Date(
        //         new Date(d).toLocaleString('en-US', {
        //             timeZone: setting.timezone,
        //             year: 'numeric',
        //             month: '2-digit',
        //             day: '2-digit',
        //             hour: '2-digit',
        //             minute: '2-digit',
        //             second: '2-digit',
        //         }),
        //     );
        // }

        //   return new Date(
        //     d.toLocaleString('en-US', {
        //         timeZone: setting.timezone,
        //         year: 'numeric',
        //         month: '2-digit',
        //         day: '2-digit',
        //         hour: '2-digit',
        //         minute: '2-digit',
        //         second: '2-digit',
        //     }),
        //   );
        let t = d.toLocaleString('en-US', {
                    timeZone: setting.timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

        var zonedTime = utcToZonedTime(d, setting.timezone)
        return zonedTime;
    }

    getUtcDateFromUserProfileTimezoneByDate(d: Date): Date {
        var setting = this.userSettingService.getUserSettingLastValue();
        var time = zonedTimeToUtc(d, setting.timezone);
        return time;
    }

    getUtcDateFromUserProfileTimezone(d: string): string {
        if(d == '0001-01-01T00:00:00' || d == null){
            return '0001-01-01T00:00:00';
        }
        var setting = this.userSettingService.getUserSettingLastValue();
        var time = zonedTimeToUtc(d, setting.timezone);
        return time.toISOString();
    }

    formatDateAndTime(date: Date | string): string {
        var d: Date = new Date(date);
        
        var month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes(),
            second = '' + d.getSeconds();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        if (hour.length < 2)
            hour = '0' + hour;
        if (minute.length < 2)
            minute = '0' + minute;
        if (second.length < 2)
            second = '0' + second;

        return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;
    }
}