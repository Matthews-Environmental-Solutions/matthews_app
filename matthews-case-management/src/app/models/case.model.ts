export class Case {
    caseRecordId: string = '';
    clientId: string = '';
    clientCaseId: string = '';
    firstName: string;
    lastName: string;
    weight: number = 100;
    containerType: string = ''; // enum to be used instead
    gender: string = ''; // enum to be used instead
    age: number = 100;
    scheduledFacility: string = ''; // better to use ID object instead
    scheduledCremator: string = ''; // is this person or what it is?
    scheduledStartTimeDate: string = '';
    scheduledEndTimeDate: string = '';
    loadSize: string = '';
    burnMode: string = '';

    constructor(clientCaseId: string , firstName: string, lastName: string, weight: number, containerType: string, gender: string, scheduledCremator: string){
        this.clientCaseId = clientCaseId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.weight = weight;
        this.containerType = containerType;
        this.gender = gender;
        this.scheduledCremator = scheduledCremator;
    }
}