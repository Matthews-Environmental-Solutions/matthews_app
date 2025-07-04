import { Injectable } from "@angular/core";
import { BehaviorSubject, concatMap, Observable, of } from "rxjs";
import { CalendarService } from "./calendar.service";
import { UserSettingService } from "./user-setting.service";
import { Device } from "../models/device.model";
import { I4connectedService } from "./i4connected.service";
import { Case } from "../models/case.model";
import { v4 as uuidv4 } from 'uuid';
import { UserDetails } from "../models/user-details.model";
import { Facility } from "../models/facility.model";
import { FacilityService } from "./facility.service";

@Injectable({
    providedIn: 'root'
})
export class StateService {

    private GUID_EMPTY: string = '00000000-0000-0000-0000-000000000000';

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

    public caseSaved$: Observable<string>;
    private caseSavedBehaviorSubject = new BehaviorSubject<string>(this.getDefaultCaseSaved());

    public filterCasesByDeviceId$: Observable<string>;
    private filterCasesByDeviceIdBehaviorSubject = new BehaviorSubject<string>(this.getDefaultFilterCasesByDeviceId());

    public filterUnscheduledCasesByFacilityId$: Observable<'all' | 'bySelectedFacility'>;
    private filterUnscheduledCasesByFacilityIdBehaviorSubject = new BehaviorSubject<'all' | 'bySelectedFacility'>(this.getDefaultFilterUnscheduledCasesByFacilityId());

    public refreshCasesList$: Observable<string>;
    private refreshCasesListBS = new BehaviorSubject<string>(this.getDefaultRefreshCasesList());

    public userDetails$: Observable<UserDetails>;
    private userDetailsBS = new BehaviorSubject<UserDetails>(this.getDefaultUserDetails());

    public canActivateFacilityUrl$: Observable<boolean>;
    public canActivateFacilityUrlBS = new BehaviorSubject<boolean>(this.getDefaultUserPermissionForFacility());

    public facilities$: Observable<Facility[]>;
    private facilitiesBS = new BehaviorSubject<Facility[]>(this.getDefaultFacility());

    public isDemoEntitiesOnly$: Observable<boolean>;
    private isDemoEntitiesOnlyBS = new BehaviorSubject<boolean>(false);

    constructor(private calendarService: CalendarService, private userSettingService: UserSettingService, private i4connectedService: I4connectedService, private facilityService: FacilityService) {
        // Initialize the BehaviorSubjects with default values
        this.selectedFacilityId$ = this.selectedFacilityIdBehaviorSubject;
        this.selectedDate$ = this.selectedDateBehaviorSubject;
        this.firstDateInWeek$ = this.firstDateInWeekBehaviorSubject;
        this.devicesFromSite$ = this.devicesFromSiteBehaviorSubject;
        this.devicesToShowAsFilter$ = this.devicesToShowAsFilterBehaviorSubject;
        this.numberOfCasesToShowAsFilter$ = this.numberOfCasesToShowAsFilterBehaviorSubject;
        this.caseSaved$ = this.caseSavedBehaviorSubject;
        this.filterCasesByDeviceId$ = this.filterCasesByDeviceIdBehaviorSubject;
        this.filterUnscheduledCasesByFacilityId$ = this.filterUnscheduledCasesByFacilityIdBehaviorSubject;
        this.refreshCasesList$ = this.refreshCasesListBS;
        this.userDetails$ = this.userDetailsBS;
        this.canActivateFacilityUrl$ = this.canActivateFacilityUrlBS;
        this.setCanActivateFacilityUrlBS(this.getCanActivateFacilityUrlBS());
        this.facilities$ = this.facilitiesBS;
        this.isDemoEntitiesOnly$ = this.isDemoEntitiesOnlyBS;
    }

    // public canActivateFacilityUrl$ : Observable<boolean> = this.checkUserPermissionForFacility();

    setIsDemoEntitiesOnly(isDemo: boolean): void {
        this.isDemoEntitiesOnlyBS.next(isDemo);
    }

    getIsDemoEntitiesOnly(): boolean {  
        return this.isDemoEntitiesOnlyBS.value;
    }

    // selectedFacilityIdBehaviorSubject
    setSelectedFacility(facility: string): void {
        //previously selected facility id
        let previousFacilityId = this.selectedFacilityIdBehaviorSubject.value;

        if (previousFacilityId.trim().length === 0){
            this.facilityService.subscribeToGroup(facility).subscribe((response) => {
                console.log(response);
            });
        } else {
            this.facilityService.unsubscribeFromGroup(previousFacilityId)
            .pipe(
                concatMap(firstResponse => { 
                    console.log('First response:', firstResponse);
                    return this.facilityService.subscribeToGroup(facility); 
                })
            )
            .subscribe((response) => { console.log(response); });
        }
        
        this.selectedFacilityIdBehaviorSubject.next(facility);
        this.i4connectedService.getDevicesByFacility2(facility).subscribe(devices => {
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


    // caseSavedBehaviorSubject
    setCaseSavedBehaviorSubject() {
        this.caseSavedBehaviorSubject.next(uuidv4());
    }

    getDefaultCaseSaved(): string{
        return uuidv4();
    }


    // filterCasesByDeviceIdBehaviorSubject
    setFilterCasesByDeviceId(deviceId: string): void {
        this.filterCasesByDeviceIdBehaviorSubject.next(deviceId);
    }

    getFilterCasesByDeviceId(): string {
        return this.filterCasesByDeviceIdBehaviorSubject.value;
    }

    getDefaultFilterCasesByDeviceId() : string {
        return 'all';
    }


    // filterUnscheduledCasesByFacilityIdBehaviorSubject
    setFilterUnscheduledCasesByFacilityId(facilityId: 'all' | 'bySelectedFacility'): void {
        this.filterUnscheduledCasesByFacilityIdBehaviorSubject.next(facilityId);
    }

    getFilterUnscheduledCasesByFacilityId(): string {
        return this.filterUnscheduledCasesByFacilityIdBehaviorSubject.value;
    }

    getDefaultFilterUnscheduledCasesByFacilityId() : 'all' | 'bySelectedFacility' {
        return 'all';
    }


    // refreshCasesListBS
    setRefreshCasesListBS() {
        this.refreshCasesListBS.next(uuidv4());
    }

    getDefaultRefreshCasesList(): string{
        return uuidv4();
    }


    // userDetailsBS
    setUserDetailsBS(user: UserDetails) {
        this.userDetailsBS.next(user);
        this.setCanActivateFacilityUrlBS(this.checkUserPermissionForFacility());
    }

    getUserDetails() : UserDetails {
        return this.userDetailsBS.value;
    }

    getDefaultUserDetails(): UserDetails{
        return new UserDetails();
    }


    // canActivateFacilityUrlBS
    setCanActivateFacilityUrlBS(permission: boolean) {
        this.canActivateFacilityUrlBS.next(permission);
    }

    getCanActivateFacilityUrlBS() : boolean {
        return this.canActivateFacilityUrlBS.value;
    }

    getDefaultUserPermissionForFacility() {
        return this.checkUserPermissionForFacility();
    }


    // facilitiesBS
    setFacilitiesBS(facilities: Facility[]) : void{
        this.facilitiesBS.next(facilities);
    }

    getFacilities(): Facility[] {
        return this.facilitiesBS.value;
    }

    getDefaultFacility(): Facility[] {
        return [];
    }


    checkUserPermissionForFacility(): boolean {
        const userDetails = this.getUserDetails();
        const requiredRoles = ['Site Manager', 'Multi-Site Manager', 'MES Support', 'SuperAdministrator'];
        var permission = requiredRoles.some(role => userDetails.roles.includes(role));
        return permission;
    }

}