import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, concat, concatMap, map, of, retry, throwError } from "rxjs";
import { Case } from "../models/case.model";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments/environment";
import { CalendarService } from "./calendar.service";
import { CaseStatusDto } from "../models/case-status-dto.model";
import { Facility } from "../models/facility.model";


@Injectable({
    providedIn: 'root'
})
export class CaseService {
    apiURL = environment.apiUrl;

    constructor(public httpClient: HttpClient, private translate: TranslateService, private calendarService: CalendarService) { }

    // getCasesFromJsonFile(days: Date[]) {
    //     return this.httpClient.get('/assets/cases.json');
    // }

    getCaseById(caseId: string): Observable<Case> {
        return this.httpClient.get<Case>(`${this.apiURL}/Case/${caseId}`)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map(item => this.remapCase(item)));
    }

    getUnscheduledCases(facilities: Facility[]): Observable<Case[]> {
        return this.httpClient.post<Case[]>(this.apiURL + '/Case/GetUnscheduledCases', facilities)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((cases: Case[]) => {
                cases = cases.map(item => this.remapCase(item));
                return cases;
            }));
    }

    getScheduledCasesByDay(facilityId: string, date: Date): Observable<Case[]> {

        date.setHours(0,0,0,0);
        let utcStartDate = this.calendarService.getUtcDateFromUserProfileTimezoneByDate(date).toISOString();
        
        return this.httpClient.get<Case[]>(`${this.apiURL}/Case/GetScheduledCasesByDay/${facilityId}/${utcStartDate}`)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((cases: Case[]) => {
                cases = cases.map(item => this.remapCase(item));
                return cases;
            }));
    }

    getScheduledCasesByWeek(facilityId: string, dateStartDateOfWeek: Date): Observable<Case[]> {
        
        dateStartDateOfWeek.setHours(0,0,0,0);
        let utcStartDateOfWeek = this.calendarService.getUtcDateFromUserProfileTimezoneByDate(dateStartDateOfWeek).toISOString();

        return this.httpClient.get<Case[]>(`${this.apiURL}/Case/GetScheduledCasesByWeek/${facilityId}/${utcStartDateOfWeek}`)
            .pipe(retry(1), catchError(this.handleError))
            .pipe(map((cases: Case[]) => {
                cases = cases.map(item => this.remapCase(item));
                return cases;
            }));
    }

    getCaseStatuses(): Observable<CaseStatusDto[]> {
        
        return this.httpClient.get<CaseStatusDto[]>(`${this.apiURL}/Case/GetCaseStatuses`)
            .pipe(retry(1), catchError(this.handleError));
    }

    save(caseForSave: Case): Observable<void> {
        return this.httpClient.post<void>(`${this.apiURL}/Case/Save`, caseForSave)
            .pipe(catchError(this.handleError));
    }

    update(caseForSave: Case): Observable<void> {
        return this.httpClient.put<void>(`${this.apiURL}/Case/Update`, caseForSave)
            .pipe(catchError(this.handleError));
    }

    deleteCase(caseId: string) {
        const deleteCaseUrl = `${environment.apiUrl}/Case/${caseId}`;
        return this.httpClient.request<Case>('DELETE', deleteCaseUrl);
    }

    formatDate(date: Date): string {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 00:00:00";
    }

    // map case
    remapCase(item: Case): Case {
        switch (item.gender) {

            case 0:
                item.genderText = this.translate.instant('male');
                break;
            case 1:
                item.genderText = this.translate.instant('female');
                break;
            case 2:
                item.genderText = this.translate.instant('other');
                break;
        }

        switch (item.containerType) {
            case 0:
                item.containerTypeText = this.translate.instant('none');
                break;
            case 1:
                item.containerTypeText = this.translate.instant('cardboard');
                break;
            case 2:
                item.containerTypeText = this.translate.instant('hardwood');
                break;
            case 3:
                item.containerTypeText = this.translate.instant('mdfParticleBoard');
                break;
            case 4:
                item.containerTypeText = this.translate.instant('bagShroud');
                break;
            case 5:
                item.containerTypeText = this.translate.instant('other');
                break;
        }

        item.scheduledStartTime = item.scheduledStartTime && item.scheduledStartTime?.length > 0 ? this.formatDateAndTime(item.scheduledStartTime) : '';


        return item;
    }

    // Error handling
    handleError(error: any) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else if(error instanceof HttpErrorResponse){
            errorMessage = error.error;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        // window.alert(errorMessage);
        return throwError(() => {
            return errorMessage;
        });
    }

    formatDateAndTime(date: string): string {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
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