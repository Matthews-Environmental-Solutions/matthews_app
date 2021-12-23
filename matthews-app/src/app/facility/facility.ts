import { IDevice } from "../device-details/device";

export interface IFacility {
    facilityId: string;
    name: string;
    devices: Array<IDevice>;
}