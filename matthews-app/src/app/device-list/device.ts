/* eslint-disable @typescript-eslint/quotes */

import { Signal } from "./signal";


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
