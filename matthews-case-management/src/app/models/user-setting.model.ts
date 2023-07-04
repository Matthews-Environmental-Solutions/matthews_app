export class UserSettingData {
    username!: string;
    startDayOfWeek!: 0 | 1;
    language!: string;
    timezone!: string;
    timeformat!: string;
    lastUsedFacilityId: string = '00000000-0000-0000-0000-000000000000';
    lastUsedCalendarView: 'byDay' | 'byWeek' = 'byDay';

    copyInto(jsonData: any) {
        this.username = jsonData.username;
        this.startDayOfWeek = jsonData.startDayOfWeek;
        this.language = jsonData.language;
        this.timezone = jsonData.timezone;
        this.timeformat = jsonData.timeformat;
        this.lastUsedFacilityId = jsonData.lastUsedFacilityId;
        this.lastUsedCalendarView = jsonData.lastUsedCalendarView;
    }
}