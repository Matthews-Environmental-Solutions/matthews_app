/* eslint-disable @typescript-eslint/quotes */
import { GenderType } from "../core/enums";
import { GenderSelection } from "./selection-option";

/* eslint-disable @typescript-eslint/no-inferrable-types */
// export interface Case {
//   id: string;

//   clientId: string;

//   clientCaseId: string;

//   firstName: string;

//   lastName: string;

//   weight: number;

//   gender: number;

//   genderText: string;

//   containerType: number;

//   containerTypeText: string;

//   containerSize: number;

//   containerSizeText: string;

//   isObsolete: boolean;

//   age: number;

//   status: number;

//   scheduledFacility?: string;

//   scheduledDevice?: string;

//   scheduledDeviceAlias: string;

//   scheduledStartTime?: string;

//   actualFacility?: string;

//   actualDevice?: string;

//   actualDeviceAlias: string;

//   actualStartTime?: string;

//   actualEndTime?: string;

//   createdBy: string;

//   createdTime: string;

//   modifiedBy?: string;

//   modifiedTime?: string;

//   performedBy?: string;

//   fuel: string;

//   electricity: string;

//   //caseToFacilityStatuses: CaseToFacilityStatus[];
// }

export class Case {
  id: string;

  clientId: string = '1'; // get ID from some API

  clientCaseId: string = '';

  firstName: string = '';

  lastName: string = '';

  weight: number;

  gender: number;

  genderText: string = '';

  containerType: number; // enum to be used instead

  containerTypeText: string = '';

  containerSize: number; // enum to be used instead

  containerSizeText: string = '';

  isObsolete: boolean = false;

  age: number;

  status: number = 0;

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

  facilityStatusId?: string = '00000000-0000-0000-0000-000000000000';

  //caseToFacilityStatuses: CaseToFacilityStatus[] = [];
}
