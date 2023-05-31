export class Device {
    id: string;
    alias: string;
    adapterId: string;
    constructor( id: string, alias: string, adapterId: string) {
        this.id = id;
        this.alias = alias;
        this.adapterId = adapterId;
    }
}