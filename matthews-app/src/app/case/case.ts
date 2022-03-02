export interface Case {
    id: number;
    caseId: string;
    caseName: string;
    weight: string;
    age: string;
    gender: string;
    containerType: string;
    containerSize: string;
    status: string;
    facilityId: string;
    selectedDevice: string;
    isObsolete: boolean;
    createdBy: string;
    createdTime: Date;
}
