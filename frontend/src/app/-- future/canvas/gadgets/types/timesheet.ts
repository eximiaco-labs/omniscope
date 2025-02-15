export interface TimesheetSummary {
  totalConsultingHours: number;
  totalInternalHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;

  uniqueClients: number;
  uniqueSponsors: number;
  uniqueCases: number;
  uniqueWorkingDays: number;
  uniqueWorkers: number;
  uniqueAccountManagers: number;
}

export interface TimesheetByKind {
  consulting: {
    uniqueClients: number;
  };
  squad: {
    uniqueClients: number;
  };
  internal: {
    uniqueClients: number;
  };
  handsOn: {
    uniqueClients: number;
  };
}

export interface TimesheetByClient {
  name: string;
  totalHours: number;
}

export interface TimesheetData {
  summary?: TimesheetSummary;
  byKind?: TimesheetByKind;
  byClient?: {
    data: TimesheetByClient[];
  };
  filterableFields?: {
    field: string;
    selectedValues: string[];
    options: string[];
  }[];
}

export interface TimesheetResponse {
  timesheet: TimesheetData;
} 