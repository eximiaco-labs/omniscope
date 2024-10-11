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
      date: string;
      totalHours: number;
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
      consulting: { uniqueItems: timesheet.byKind.consulting.uniqueWorkingDays },
      squad: { uniqueItems: timesheet.byKind.squad.uniqueWorkingDays },
      internal: { uniqueItems: timesheet.byKind.internal.uniqueWorkingDays },
      handsOn: { uniqueItems: timesheet.byKind.handsOn.uniqueWorkingDays },
    },
    byItem: timesheet.byDate.map(day => ({
      name: day.date,
      totalConsultingHours: day.totalConsultingHours,
      totalSquadHours: day.totalSquadHours,
      totalInternalHours: day.totalInternalHours,
      totalHandsOnHours: day.totalHandsOnHours,
    })),
  };

  const labels = {
    total: "Number of Working Days",
    consulting: "Consulting Days",
    squad: "Squad Days",
    internal: "Internal Days",
    handsOn: "Hands-On Days",
  };

  return <By title="By Working Day" data={data} labels={labels} className={className} />;
}
