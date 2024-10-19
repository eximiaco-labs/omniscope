import { By } from "@/app/components/analytics/By";

interface BySponsorProps {
  timesheet: {
    uniqueSponsors: number;
    byKind: {
      consulting: {
        uniqueSponsors: number;
      };
      squad: {
        uniqueSponsors: number;
      };
      internal: {
        uniqueSponsors: number;
      };
      handsOn: {
        uniqueSponsors: number;
      };
    };
    bySponsor: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
      totalHandsOnHours: number;
    }>;
  };
}

export function BySponsor({ timesheet, className }: BySponsorProps & { className?: string }) {
  const data = {
    uniqueItems: timesheet.uniqueSponsors,
    byKind: {
      consulting: { uniqueItems: timesheet.byKind.consulting.uniqueSponsors },
      squad: { uniqueItems: timesheet.byKind.squad.uniqueSponsors },
      internal: { uniqueItems: timesheet.byKind.internal.uniqueSponsors },
      handsOn: { uniqueItems: timesheet.byKind.handsOn.uniqueSponsors },
    },
    byItem: timesheet.bySponsor,
  };

  const labels = {
    total: "Sponsors",
    consulting: "Consulting Sponsors",
    squad: "Squad Sponsors",
    internal: "Internal Sponsors",
    handsOn: "Hands-On Sponsors",
  };

  return <By title="By Sponsor" data={data} labels={labels} className={className} />;
}
