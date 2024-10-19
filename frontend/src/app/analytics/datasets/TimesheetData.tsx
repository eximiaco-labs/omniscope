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
        className="mb-6"
      />
      <ByClient timesheet={filteredData.timesheet} className="mb-6" />
      <ByAccountManager timesheet={filteredData.timesheet} className="mb-6" />
      <ByWorker timesheet={filteredData.timesheet} className="mb-6" />
      <BySponsor timesheet={filteredData.timesheet} className="mb-6" />
      <ByWorkingDay timesheet={filteredData.timesheet} />
    </>
  );
};

export default TimesheetData;
