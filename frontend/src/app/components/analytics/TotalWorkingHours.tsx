import { Stat } from "@/app/components/analytics/stat";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";

interface TotalWorkingHoursProps {
  timesheet: {
    totalHours: number;
    totalConsultingHours: number;
    totalHandsOnHours: number;
    totalSquadHours: number;
    totalInternalHours: number;
  };
}

export function TotalWorkingHours({ timesheet, className }: TotalWorkingHoursProps & { className?: string }) {
  return (
    <div className={className}>
      <Heading>Total Working Hours</Heading>
      <Divider className="my-3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          title="Total"
          value={timesheet.totalHours.toFixed(1)}
        />
        <Stat
          title="Consulting"
          value={timesheet.totalConsultingHours.toFixed(1)}
          color="#F59E0B"
          total={timesheet.totalHours}
        />
        <Stat
          title="Hands-On"
          value={timesheet.totalHandsOnHours.toFixed(1)}
          color="#8B5CF6"
          total={timesheet.totalHours}
        />
        <Stat
          title="Squad"
          value={timesheet.totalSquadHours.toFixed(1)}
          color="#3B82F6"
          total={timesheet.totalHours}
        />
        <Stat
          title="Internal"
          value={timesheet.totalInternalHours.toFixed(1)}
          color="#10B981"
          total={timesheet.totalHours}
        />
      </div>
    </div>
  );
}