export enum GadgetType {
  TIMESHEET = 'timesheet'
}

export interface Position {
  x: number;
  y: number;
}

export interface BaseGadgetConfig {
  title: string;
  type: GadgetType;
}

export interface TimesheetGadgetConfig extends BaseGadgetConfig {
  type: GadgetType.TIMESHEET;
  slug: string;
}

export type GadgetConfig = TimesheetGadgetConfig;

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
  onConfigure: (gadget: Gadget) => void;
}

export interface GadgetSettingsProps<T extends GadgetConfig> {
  config: T;
  onChange: (config: T) => void;
}

export * from './Timesheet'; 