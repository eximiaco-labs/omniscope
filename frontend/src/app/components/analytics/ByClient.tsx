import { By } from "@/app/components/analytics/By";

interface ByClientProps {
  timesheet: {
    uniqueClients: number;
    averageHoursPerClient: number;
    stdDevHoursPerClient: number;
    byKind: {
      consulting: {
        uniqueClients: number;
      };
      squad: {
        uniqueClients: number;
      };
      internal: {
        uniqueClients: number;
      };
    };
    byClient: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };
}

export function ByClient({ timesheet, className }: ByClientProps & { className?: string }) {
  const data = {
    uniqueItems: timesheet.uniqueClients,
    byKind: {
      consulting: { uniqueItems: timesheet.byKind.consulting.uniqueClients },
      squad: { uniqueItems: timesheet.byKind.squad.uniqueClients },
      internal: { uniqueItems: timesheet.byKind.internal.uniqueClients },
    },
    byItem: timesheet.byClient,
  };

  const labels = {
    total: "Number of Clients",
    consulting: "Number of Consulting Clients",
    squad: "Number of Squad Clients",
    internal: "Number of Internal Clients",
  };

  return <By title="Client" data={data} labels={labels} className={className} />;
}