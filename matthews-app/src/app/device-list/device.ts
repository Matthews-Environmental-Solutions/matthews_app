import { Signal } from "./Signal";

export interface Device {
  id: string;
  name: string;
  alias: string;
  deviceTypeId: number;
  deviceTypeName: string;
  deviceModelId: number;
  deviceModelName: string;
  signals: Signal[];
}
