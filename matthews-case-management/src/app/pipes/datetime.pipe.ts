import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { UserSettingData } from "../models/user-setting.model";
import { UserSettingService } from "../services/user-setting.service";

@Pipe({ name: 'timepipe' })
export class DatetimePipe implements PipeTransform {

  datetimeFormat: '12' | '24' = '24';

  constructor(private userSettingService: UserSettingService) { }

  transform(date: Date | string | undefined, showDate: boolean, showTime: boolean): string | null {
    if (!date) {
      return null;
    }
    date = new Date(date);  // if orginal type was a string
    // if date is invalid, return empty string
    if (isNaN(date.getTime())) {
      return "";
    }

    if(date.getFullYear() == 1){
      return "";
    }
    let dateShift = date;
    let setting: UserSettingData = this.userSettingService.getUserSettingLastValue();

    let format = '';
    if (setting) {

      format += showDate ? 'dd-MM-yyyy' : '';

      if(setting.timeformat == '12'){
        format += showTime ? ' hh:mm a' : '';
      } else {
        format += showTime ? ' HH:mm' : '';
      }


      dateShift = this.changeTimezone(date, setting.timezone);
    }
    return new DatePipe('en-US').transform(dateShift, format);
  }

  changeTimezone(date: Date, ianatz: string) {

    // suppose the date is 12:00 UTC
    var invdate = new Date(date.toLocaleString('en-US', {
      timeZone: ianatz
    }));

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    var diff = date.getTime() - invdate.getTime();

    // so 12:00 in Toronto is 17:00 UTC
    return new Date(date.getTime() - diff); // needs to substract

  }
}
