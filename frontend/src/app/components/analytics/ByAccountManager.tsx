import { By } from "@/app/components/analytics/By";

interface ByAccountManagerProps {
  timesheet: {
    uniqueAccountManagers: number;
    byKind: {
      consulting: {
        uniqueAccountManagers: number;
      };
      squad: {
        uniqueAccountManagers: number;
      };
      internal: {
        uniqueAccountManagers: number;
      };
      handsOn: {
        uniqueAccountManagers: number;
      };
    };
    byAccountManager: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
      totalHandsOnHours: number;
    }>;
  };
}

export function ByAccountManager({ timesheet, className }: ByAccountManagerProps & { className?: string }) {
  const data = {
    uniqueItems: timesheet.uniqueAccountManagers,
    byKind: {
      consulting: { uniqueItems: timesheet.byKind.consulting.uniqueAccountManagers },
      squad: { uniqueItems: timesheet.byKind.squad.uniqueAccountManagers },
      internal: { uniqueItems: timesheet.byKind.internal.uniqueAccountManagers },
      handsOn: { uniqueItems: timesheet.byKind.handsOn.uniqueAccountManagers },
    },
    byItem: timesheet.byAccountManager,
  };

  const labels = {
    total: "Account Managers",
    consulting: "Consulting",
    squad: "Squad",
    internal: "Internal",
    handsOn: "Hands-On",
  };

  return <By title="By Account Manager" data={data} labels={labels} className={className} />;
}
