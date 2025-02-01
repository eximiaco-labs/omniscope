export enum GadgetType {
  TEXT = 'text',
  CHART = 'chart',
  IMAGE = 'image',
  NOTES = 'notes',
  TIMESHEET = 'timesheet'
}

export interface Position {
  x: number;
  y: number;
}

export interface GadgetConfig {
  title: string;
  [key: string]: any;
}

export interface Gadget {
  id: string;
  type: GadgetType;
  position: Position;
  config: GadgetConfig;
}

export interface GadgetProps {
  id: string;
  type: GadgetType;
  position: Position;
  onDragEnd: (id: string, newPosition: Position) => void;
  onRemove: (id: string) => void;
  onConfigure: (gadget: Gadget) => void;
  scale: number;
  config: GadgetConfig;
  children: React.ReactNode;
}

export * from './types';
export * from './Timesheet';
export * from './GadgetWrapper';
export * from './GadgetSettings';

export const getGadgetTitle = (type: GadgetType): string => {
  switch (type) {
    case GadgetType.TEXT:
      return 'Text';
    case GadgetType.CHART:
      return 'Chart';
    case GadgetType.IMAGE:
      return 'Image';
    case GadgetType.NOTES:
      return 'Notes';
    case GadgetType.TIMESHEET:
      return 'Timesheet';
    default:
      return 'Unknown';
  }
}; 