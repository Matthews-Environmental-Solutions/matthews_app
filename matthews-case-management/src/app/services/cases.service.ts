import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CaseService {
    constructor(public httpClient: HttpClient) { }

    getCases(days: Date[]) {
        return this.httpClient.get('/assets/cases.json');
    }
}