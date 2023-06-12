import { CaseStatus } from "../enums/case-status.enum";
import { GenderType } from "../enums/gender-type.enum";

export interface ICase {
    id: string;
    clientId: string;
    clientCaseId: string;

    firstName: string;
    lastName: string;
    weight: number;
    gender: number;
    genderText: string;
    containerType: number;
    containerTypeText: string;
    containerSize: number;
    containerSizeText: string;
    isObsolete: boolean;
    age: number;
    status: number;

    scheduledFacility?: string;
    scheduledDevice?: string;
    scheduledDeviceAlias: string;
    scheduledStartTime?: string;
    
    actualFacility?: string;
    actualDevice?: string;
    actualDeviceAlias: string;
    actualStartTime?: string;
    actualEndTime?: string;

    createdBy: string;
    createdTime: string;
    modifiedBy?: string;
    modifiedTime?: string;
    performedBy?: string;

    fuel: string;
    electricity: string;
}

export class Case implements ICase{
    id: string = '00000000-0000-0000-0000-000000000000';
    clientId: string = '1'; // get ID from some API
    clientCaseId: string = '';

    firstName: string = '';
    lastName: string = '';
    weight: number = 100;
    gender: number = 0;
    genderText: string = '';
    containerType: number = 0; // enum to be used instead
    containerTypeText: string = '';
    containerSize: number = 0; // enum to be used instead
    containerSizeText: string = '';
    isObsolete: boolean = false;
    age: number = 100;
    status: number = 0;
    
    scheduledFacility?: string;
    scheduledDevice?: string;
    scheduledDeviceAlias: string = '';
    scheduledStartTime?: string = '';
    
    actualFacility?: string;
    actualDevice?: string;
    actualDeviceAlias: string = '';
    actualStartTime?: string;
    actualEndTime?: string;

    createdBy: string = '00000000-0000-0000-0000-000000000000';
    createdTime: string = '0001-01-01T00:00:00';
    modifiedBy?: string;
    modifiedTime?: string;
    performedBy?: string;

    fuel: string = '';
    electricity: string = '';

    // constructor(id: string, clientId: string, clientCaseId: string, firstName: string, lastName: string, weight: number, containerType: string, gender: string, scheduledCremator: string){
    //     this.id = id;
    //     this.clientId = clientId;
    //     this.clientCaseId = clientCaseId;
    //     this.firstName = firstName;
    //     this.lastName = lastName;
    //     this.weight = weight;
    //     this.containerType = containerType;
    //     this.gender = gender;
    //     this.scheduledCremator = scheduledCremator;
    // }
}