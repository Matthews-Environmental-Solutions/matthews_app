export class FacilityStatus {
    id!: string; //GUID
    createdBy!: string; //GUID
    createdTime!: Date;
    modifiedBy!: string; //GUID
    modifiedTime!: Date;
    facilityId!: string;
    statusCode!: number;
    statusName!: string;
    statusIcon!: string;
    startProcess!: boolean;
}