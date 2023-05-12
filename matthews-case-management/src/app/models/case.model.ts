import { CaseStatus } from "../enums/case-status.enum";
import { GenderType } from "../enums/gender-type.enum";

export interface ICase {
    id: string;
    clientId: string;
    clientCaseId: string;

    facilityId: string;
    firstName: string;
    lastName: string;
    weight: number;
    gender: string;
    containerType: string;
    containerSize: string;
    isObsolete: boolean;
    age: number;
    status: string;

    scheduledFacility: string;
    scheduledDevice: string;
    scheduledDeviceAlias: string;
    scheduledStartTime: string;
    
    actualFacility: string;
    actualDevice: string;
    actualDeviceAlias: string;
    actualStartTime: string;
    actualEndTime: string;

    createdBy: string;
    createdTime: string;
    modifiedBy: string;
    modifiedTime: string;
    performedBy: string;

    fuel: string;
    electricity: string;
}

export class Case implements ICase{
    id: string = '';
    clientId: string = '';
    clientCaseId: string = '';

    facilityId: string = '';
    firstName: string = '';
    lastName: string = '';
    weight: number = 100;
    gender: string = '';
    containerType: string = ''; // enum to be used instead
    containerSize: string = ''; // enum to be used instead
    isObsolete: boolean = false;
    age: number = 100;
    status: string = '';
    
    scheduledFacility: string = '';
    scheduledDevice: string = '';
    scheduledDeviceAlias: string = '';
    scheduledStartTime: string = '';
    
    actualFacility: string = '';
    actualDevice: string = '';
    actualDeviceAlias: string = '';
    actualStartTime: string = '';
    actualEndTime: string = '';

    createdBy: string = '';
    createdTime: string = '';
    modifiedBy: string = '';
    modifiedTime: string = '';
    performedBy: string = '';

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