import { Signal } from "./Signal";

export interface Device {
  id: string;
  name: string;
  signals: Signal[]
}
