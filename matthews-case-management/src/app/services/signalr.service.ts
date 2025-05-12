import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr"
import { environment } from "src/environments/environment";
import { StateService } from "./states.service";
import { Facility } from "../models/facility.model";

@Injectable({
    providedIn: 'root'
})
export class SignalrService {

    apiURL = environment.apiUrl;
    public data: string = 'Ovo je poruka';

    private hubConnectionToCaseHub!: signalR.HubConnection;
    private hubConnectionToFacilityHub!: signalR.HubConnection;

    constructor(private stateService: StateService) {
        this.hubConnectionToCaseHub = new signalR.HubConnectionBuilder()
            .withUrl(`${this.apiURL}/casehub`)
            .withAutomaticReconnect()
            .build();

        this.hubConnectionToFacilityHub = new signalR.HubConnectionBuilder()
            .withUrl(`${this.apiURL}/facilityhub`)
            .withAutomaticReconnect()
            .build();
    }

    public startConnectionToCaseHub = () => {
        this.hubConnectionToCaseHub
            .start()
            .then(() => console.log('SignalR connection started - CaseHub'))
            .catch(err => console.log('Error while starting SignalR connection to CaseHub: ' + err))
    }

    public stopConnectionToCaseHub = () => {
        this.hubConnectionToCaseHub
            .stop()
            .then(() => console.log('SignalR connection stopped - CaseHub'))
            .catch(err => console.log('Error while stopping SignalR connection to CaseHub: ' + err));
    }

    public startConnectionToFacilityHub = () => {
        this.hubConnectionToFacilityHub
            .start()
            .then(() => console.log('SignalR connection started - FacilityHub'))
            .catch(err => console.log('Error while starting SignalR connection to FacilityHub: ' + err))
    }

    public stopConnectionToFacilityHub = () => {
        this.hubConnectionToFacilityHub
            .stop()
            .then(() => console.log('SignalR connection stopped - FacilityHub'))
            .catch(err => console.log('Error while stopping SignalR connection to FacilityHub: ' + err));
    }

    public addCaseDataListener = () => {
        this.hubConnectionToCaseHub.on('refreshcaseslist', (data) => {
            this.stateService.setRefreshCasesListBS();
        });
    }

    public addFacilityDataListener = () => {
        this.hubConnectionToFacilityHub.on('facilitylist', (data) => {
            const facilities: Facility[] = JSON.parse(data);
            
            //filter out const facilities with facilities that are already in the state
            const filteredFacilities = facilities.filter(facility => {
                return this.stateService.getFacilities().some(existingFacility => existingFacility.id === facility.id);
            });
            

            this.stateService.setFacilitiesBS(filteredFacilities);
        });
    }
}