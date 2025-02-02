export enum GadgetType {
  TIMESHEET = 'timesheet',
  BY_CLIENT = 'by-client'
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
  onConfigure: (gadget: Gadget) => void;
}

export interface GadgetSettingsProps<T extends GadgetConfig> {
  config: T;
  onChange: (config: T) => void;
}

export * from './Timesheet';
export * from './ByClient'; 