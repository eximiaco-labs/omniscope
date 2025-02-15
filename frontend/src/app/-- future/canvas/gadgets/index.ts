import { GadgetType, GadgetConfig } from './types';

export interface Position {
  x: number;
  y: number;
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
    case GadgetType.TIMESHEET:
      return 'Timesheet';
    case GadgetType.BY_CLIENT:
      return 'By Client';
    default:
      return 'Unknown';
  }
}; 