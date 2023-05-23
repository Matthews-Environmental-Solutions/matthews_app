import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class StateService {
    
    public selectedFacilityId$: Observable<string>;
    private selectedFacilityIdBehaviorSubject = new BehaviorSubject<string>(this.getDefaultFacilityId());

    public selectedDate$: Observable<Date>;
    private selectedDateBehaviorSubject = new BehaviorSubject<Date>(this.getDefaultDate());

    constructor() {
        this.selectedFacilityId$ = this.selectedFacilityIdBehaviorSubject;
        this.selectedDate$ = this.selectedDateBehaviorSubject;
    }

    setSelectedFacility(facility: string): void {
        this.selectedFacilityIdBehaviorSubject.next(facility);
    }

    getSelectedFacility() : string {
        return this.selectedFacilityIdBehaviorSubject.value;
    }

    getDefaultFacilityId(): string {
        return '';
    }


    setSelectedDate(date: Date): void {
        this.selectedDateBehaviorSubject.next(date);
    }

    getSelectedDate() : Date {
        return this.selectedDateBehaviorSubject.value;
    }

    getDefaultDate(): Date {
        return new Date();
    }
}