export class Device {
    id: string;
    alias: string;
    adapterId: string;
    numberOfAttachedCases: number;
    deviceTypeId: number;

    constructor(
        id: string,
        alias: string,
        adapterId: string,
        numberOfAttachedCases: number,
        deviceTypeId: number 
    ) {
        this.id = id;
        this.alias = alias;
        this.adapterId = adapterId;
        this.numberOfAttachedCases = numberOfAttachedCases;
        this.deviceTypeId = deviceTypeId;
    }
}
