import { Injectable } from "@angular/core";
import { getWeek, startOfWeek, addDays, getDate, getMonth } from 'date-fns'
import { listTimeZones } from 'timezone-support';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {

    getWeekNumberByDate(date: Date): number {
        const result = getWeek(date, {
            weekStartsOn: 1
        });
        console.log('Week number', result);
        return result;

    }

    /**
     * 
     * @param date 
     * @param startDayOfWeek is number.   The 0 is for Sundau, while 1 is for Monday 
     * @returns 
     */
    getStartDayOfTheWeekForGivenDate(date: Date, startDayOfWeek: 0 | 1) {
        const day = startOfWeek(date, {
            weekStartsOn: startDayOfWeek
        });
        console.log('First day of the week for given date', day);
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

        console.log('Days of the week', days);
        return days;
    }

    addDays(date: Date, numberOfDaysToAdd: number): Date {
        return addDays(date, numberOfDaysToAdd);
    }

    getDateAndMonth(date: Date): string {
        let monthName = date.toLocaleString('en-us', { month: 'short' });
        return `${getDate(date).toString()} ${monthName}`;
    }

    getAllTimeZones(): string[] {
        return listTimeZones();
    }

}