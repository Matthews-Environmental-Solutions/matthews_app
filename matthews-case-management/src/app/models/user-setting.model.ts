export class UserSettingData {
    username!: string;
    startDayOfWeek!: string;
    language!: string;
    timezone!: string;
    timeformat!: string;

    copyInto(jsonData: any) {
        this.username = jsonData.username;
        this.startDayOfWeek = jsonData.startDayOfWeek;
        this.language = jsonData.language;
        this.timezone = jsonData.timezone;
        this.timeformat = jsonData.timeformat;
    }
}