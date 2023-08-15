export class FacilityStatus {
  id = '00000000-0000-0000-0000-000000000000'; //GUID

  createdBy!: string; //GUID

  createdTime!: string;

  modifiedBy!: string; //GUID

  modifiedTime!: string;

  facilityId!: string;

  statusCode!: number;

  statusName!: string;

  statusIcon!: string;

  startProcess = false;
}
