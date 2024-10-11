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
      consulting: { uniqueItems: timesheet.byKind.consulting.uniqueWorkers },
      squad: { uniqueItems: timesheet.byKind.squad.uniqueWorkers },
      internal: { uniqueItems: timesheet.byKind.internal.uniqueWorkers },
      handsOn: { uniqueItems: timesheet.byKind.handsOn.uniqueWorkers },
    },
    byItem: timesheet.byWorker,
  };

  const labels = {
    total: "Number of Workers",
    consulting: "Consultants",
    squad: "Engineers",
    internal: "Internal",
    handsOn: "Hands-On",
  };

  return <By title="By Worker" data={data} labels={labels} className={className} />;
}