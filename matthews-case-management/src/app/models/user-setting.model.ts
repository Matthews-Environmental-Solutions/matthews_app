export class UserSettingData {
    username!: string;
    startDayOfWeek!: number;

    copyInto(jsonData: any) {
        this.username = jsonData.username;
        this.startDayOfWeek = jsonData.startDayOfWeek;
    }
}