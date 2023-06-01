import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CalendarService } from "./calendar.service";
import { UserSettingService } from "./user-setting.service";
import { Device } from "../models/device.model";
import { I4connectedService } from "./i4connected.service";
import { Case } from "../models/case.model";

@Injectable({
    providedIn: 'root'
})
export class StateService {

    public selectedFacilityId$: Observable<string>;
    private selectedFacilityIdBehaviorSubject = new BehaviorSubject<string>(this.getDefaultFacilityId());

    public selectedDate$: Observable<Date>;
    private selectedDateBehaviorSubject = new BehaviorSubject<Date>(this.getDefaultDate());

    public firstDateInWeek$: Observable<Date>;
    private firstDateInWeekBehaviorSubject = new BehaviorSubject<Date>(this.getDefaultFirstDateInWeek());

    public devicesFromSite$: Observable<Device[]>;
    private devicesFromSiteBehaviorSubject = new BehaviorSubject<Device[]>(this.getDefaultDevicesFromSite());

    public devicesToShowAsFilter$: Observable<Device[]>;
    private devicesToShowAsFilterBehaviorSubject = new BehaviorSubject<Device[]>(this.getDefaultDevicesToShowAsFilter());

    public numberOfCasesToShowAsFilter$: Observable<number>;
    private numberOfCasesToShowAsFilterBehaviorSubject = new BehaviorSubject<number>(0);

    constructor(private calendarService: CalendarService, private userSettingService: UserSettingService, private i4connectedService: I4connectedService) {
        this.selectedFacilityId$ = this.selectedFacilityIdBehaviorSubject;
        this.selectedDate$ = this.selectedDateBehaviorSubject;
        this.firstDateInWeek$ = this.firstDateInWeekBehaviorSubject;
        this.devicesFromSite$ = this.devicesFromSiteBehaviorSubject;
        this.devicesToShowAsFilter$ = this.devicesToShowAsFilterBehaviorSubject;
        this.numberOfCasesToShowAsFilter$ = this.numberOfCasesToShowAsFilterBehaviorSubject;
    }


    // selectedFacilityIdBehaviorSubject
    setSelectedFacility(facility: string): void {
        this.selectedFacilityIdBehaviorSubject.next(facility);
        this.i4connectedService.getDevicesByFacility(facility).subscribe(devices => {
            this.devicesFromSiteBehaviorSubject.next(devices);
        });
    }

    getSelectedFacility(): string {
        return this.selectedFacilityIdBehaviorSubject.value;
    }

    getDefaultFacilityId(): string {
        return '';
    }


    // selectedDateBehaviorSubject
    setSelectedDate(date: Date): void {
        this.selectedDateBehaviorSubject.next(date);
    }

    getSelectedDate(): Date {
        return this.selectedDateBehaviorSubject.value;
    }

    getDefaultDate(): Date {
        return new Date();
    }


    // firstDateInWeekBehaviorSubject
    setFirstDateInWeek(date: Date): void {
        this.firstDateInWeekBehaviorSubject.next(date);
    }

    getFirstDateInWeek(): Date {
        return this.firstDateInWeekBehaviorSubject.value;
    }

    getDefaultFirstDateInWeek(): Date {
        let startDayOfWeek = this.userSettingService.getUserSettingLastValue().startDayOfWeek;
        return this.calendarService.getStartDayOfTheWeekForGivenDate(this.getDefaultDate(), startDayOfWeek);
    }


    // devicesFromSiteBehaviorSubject
    setDevicesFromSite(devices: Device[]): void {
        this.devicesFromSiteBehaviorSubject.next(devices);
    }

    getDevicesFromSite(): Device[] {
        return this.devicesFromSiteBehaviorSubject.value;
    }

    getDefaultDevicesFromSite(): Device[] {
        return [];
    }


    // devicesToShowAsFilterBehaviorSubject
    setDevicesToShowAsFilter(devices: Device[]): void {
        this.devicesToShowAsFilterBehaviorSubject.next(devices);
    }

    getDevicesToShowAsFilter(): Device[] {
        return this.devicesToShowAsFilterBehaviorSubject.value;
    }

    getDefaultDevicesToShowAsFilter(): Device[] {
        return [];
    }


    // numberOfCasesToShowAsFilterBehaviorSubject
    setNumberOfCasesToShowAsFilter(numberOfCases: number): void {
        this.numberOfCasesToShowAsFilterBehaviorSubject.next(numberOfCases);
    }

    getNumberOfCasesToShowAsFilter(): number {
        return this.numberOfCasesToShowAsFilterBehaviorSubject.value;
    }


    parseCasesByDevices(cases: Case[]) {
        let devicesFromSite = this.getDevicesFromSite();

        devicesFromSite.forEach(device => {
            let numberOfCases: number = cases.filter(c => c.scheduledDevice == device.id).length;
            device.numberOfAttachedCases = numberOfCases;
        })

        this.setNumberOfCasesToShowAsFilter(cases.length);
        this.setDevicesToShowAsFilter(devicesFromSite);
    }
}