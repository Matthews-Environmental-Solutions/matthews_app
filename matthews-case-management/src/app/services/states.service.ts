import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class StateService {
    
    public selectedFacilityId$: Observable<string>;
    private selectedFacilityIdBehaviorSubject = new BehaviorSubject<string>(this.getDefaultFacilityId());

    constructor() {
        this.selectedFacilityId$ = this.selectedFacilityIdBehaviorSubject;
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
}