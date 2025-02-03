import { Option } from "react-tailwindcss-select/dist/components/type";

export enum GadgetType {
  TIMESHEET = 'TIMESHEET',
  BY_CLIENT = 'BY_CLIENT'
}

export interface Position {
  x: number;
  y: number;
}

export interface BaseGadgetConfig {
  type: GadgetType;
  readonly title: string;
}

export interface TimesheetGadgetConfig extends BaseGadgetConfig {
  type: GadgetType.TIMESHEET;
  selectedPeriods?: Option[];
}

export interface ByClientGadgetConfig extends BaseGadgetConfig {
  type: GadgetType.BY_CLIENT;
  slug: string;
}

export type GadgetConfig = TimesheetGadgetConfig | ByClientGadgetConfig;

export interface Gadget {
  id: string;
  position: Position;
  type: GadgetType;
  config: GadgetConfig;
}

export interface GadgetProps {
  id: string;
  position: Position;
  type: GadgetType;
  config: GadgetConfig;
}

export * from './Timesheet';
export * from './ByClient'; 