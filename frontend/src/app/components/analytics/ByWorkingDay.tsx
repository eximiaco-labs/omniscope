import { By } from "@/app/components/analytics/By";

interface ByWorkingDayProps {
  timesheet: {
    uniqueWorkingDays: number;
    byKind: {
      consulting: {
        uniqueWorkingDays: number;
      };
      squad: {
        uniqueWorkingDays: number;
      };
      internal: {
        uniqueWorkingDays: number;
      };
      handsOn: {
        uniqueWorkingDays: number;
      };
    };
    byDate: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
      totalHandsOnHours: number;
    }>;
  };
}

export function ByWorkingDay({ timesheet, className }: ByWorkingDayProps & { className?: string }) {
  const data = {
    uniqueItems: timesheet.uniqueWorkingDays,
    byKind: {
      consulting: { uniqueItems: timesheet.byKind?.consulting?.uniqueWorkingDays ?? 0 },
      squad: { uniqueItems: timesheet.byKind?.squad?.uniqueWorkingDays ?? 0 },
      internal: { uniqueItems: timesheet.byKind?.internal?.uniqueWorkingDays ?? 0 },
      handsOn: { uniqueItems: timesheet.byKind?.handsOn?.uniqueWorkingDays ?? 0 },
    },
    byItem: timesheet.byDate.map(day => ({
      ...day,
      name: new Date(day.name).toLocaleDateString(),
    })),
  };

  const labels = {
    total: "Working Days",
    consulting: "Consulting Days",
    squad: "Squad Days",
    internal: "Internal Days",
    handsOn: "Hands-On Days",
  };

  return <By title="By Working Day" data={data} labels={labels} className={className} />;
}
