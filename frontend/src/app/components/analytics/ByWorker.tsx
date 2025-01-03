import { By } from "@/app/components/analytics/By";

interface ByWorkerProps {
  timesheet: {
    uniqueWorkers: number;
    byKind: {
      consulting: {
        uniqueWorkers: number;
      };
      squad: {
        uniqueWorkers: number;
      };
      internal: {
        uniqueWorkers: number;
      };
      handsOn: {
        uniqueWorkers: number;
      };
    };
    byWorker: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
      totalHandsOnHours: number;
    }>;
  };
}

export function ByWorker({ timesheet, className }: ByWorkerProps & { className?: string }) {
  const data = {
    uniqueItems: timesheet.uniqueWorkers,
    byKind: {
      consulting: { uniqueItems: timesheet.byKind?.consulting?.uniqueWorkers ?? 0 },
      squad: { uniqueItems: timesheet.byKind?.squad?.uniqueWorkers ?? 0 },
      internal: { uniqueItems: timesheet.byKind?.internal?.uniqueWorkers ?? 0 },
      handsOn: { uniqueItems: timesheet.byKind?.handsOn?.uniqueWorkers ?? 0 },
    },
    byItem: timesheet.byWorker,
  };

  const labels = {
    total: "Workers",
    consulting: "Consultants",
    squad: "Engineers",
    internal: "Internal",
    handsOn: "Hands-On",
  };

  return <By title="By Worker" data={data} labels={labels} className={className} />;
}