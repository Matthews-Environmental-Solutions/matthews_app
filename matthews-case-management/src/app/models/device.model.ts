export class Device {
    id: string;
    alias: string;
    adapterId: string;
    numberOfAttachedCases: number;
    constructor( id: string, alias: string, adapterId: string, numberOfAttachedCases: number) {
        this.id = id;
        this.alias = alias;
        this.adapterId = adapterId;
        this.numberOfAttachedCases = numberOfAttachedCases;
    }
}