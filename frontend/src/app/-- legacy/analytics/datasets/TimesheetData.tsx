import React from 'react';
import { TotalWorkingHours } from "@/app/components/analytics/TotalWorkingHours";
import { ByClient } from "@/app/components/analytics/ByClient";
import { ByWorker } from "@/app/components/analytics/ByWorker";
import { ByWorkingDay } from "@/app/components/analytics/ByWorkingDay";
import { BySponsor } from "@/app/components/analytics/BySponsor";
import { ByAccountManager } from "@/app/components/analytics/ByAccountManager";

interface TimesheetDataProps {
  filteredData: any;
}

const TimesheetData: React.FC<TimesheetDataProps> = ({
  filteredData
}) => {
  if (!filteredData || !filteredData.timesheet) {
    return null;
  }

  return (
    <>
      <TotalWorkingHours
        timesheet={filteredData.timesheet}
        className="mb-4"
      />
      <ByClient timesheet={filteredData.timesheet} className="mb-4" />
      <ByAccountManager timesheet={filteredData.timesheet} className="mb-4" />
      <ByWorker timesheet={filteredData.timesheet} className="mb-4" />
      <BySponsor timesheet={filteredData.timesheet} className="mb-4" />
      <ByWorkingDay timesheet={filteredData.timesheet} />
    </>
  );
};

export default TimesheetData;
