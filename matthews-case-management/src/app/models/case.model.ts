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
    isObsolete: boolean;
    age: number;

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

    facilityStatusId: string;
    facilityStatusText: string;
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
    isObsolete: boolean = false;
    age: number = 100;
    
    scheduledFacility: string = '00000000-0000-0000-0000-000000000000';
    scheduledDevice?: string = '00000000-0000-0000-0000-000000000000';
    scheduledDeviceAlias: string = '';
    scheduledStartTime?: string = '0001-01-01T00:00:00';
    
    actualFacility?: string = '00000000-0000-0000-0000-000000000000';
    actualDevice?: string = '00000000-0000-0000-0000-000000000000';
    actualDeviceAlias: string = '';
    actualStartTime?: string = '0001-01-01T00:00:00';
    actualEndTime?: string = '0001-01-01T00:00:00';

    createdBy: string = '00000000-0000-0000-0000-000000000000';
    createdTime: string = '0001-01-01T00:00:00';
    modifiedBy?: string = '00000000-0000-0000-0000-000000000000';
    modifiedTime?: string = '0001-01-01T00:00:00';
    performedBy?: string = '00000000-0000-0000-0000-000000000000';

    fuel: string = '';
    electricity: string = '';

    facilityStatusId: string = '00000000-0000-0000-0000-000000000000';
    facilityStatusText: string = '';
    physicalId?: string = '';

    status: number = -1;
}