import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr"
import { environment } from "src/environments/environment";
import { StateService } from "./states.service";

@Injectable({
    providedIn: 'root'
})
export class SignalrService {

    apiURL = environment.apiUrl;
    public data: string = 'Ovo je poruka';

    constructor(private stateService: StateService) {
    }

    private hubConnection!: signalR.HubConnection;

    public startConnection = () => {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.apiURL}/casehub`)
            .build();
        this.hubConnection
            .start()
            .then(() => console.log('SignalR connection started'))
            .catch(err => console.log('Error while starting SignalR connection: ' + err))
    }

    public addCaseDataListener = () => {
        this.hubConnection.on('refreshcaseslist', (data) => {
            this.stateService.setRefreshCasesListBS();
            this.data = data;
            console.log(data);
        });
    }
}