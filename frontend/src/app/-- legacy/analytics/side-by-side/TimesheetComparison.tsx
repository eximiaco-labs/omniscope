import React from 'react';
import ComparisonCard from './ComparisonCard';

interface TimesheetComparisonProps {
  leftTimesheet: any;
  rightTimesheet: any;
}

const TimesheetComparison: React.FC<TimesheetComparisonProps> = ({ leftTimesheet, rightTimesheet }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ComparisonCard title="Total Hours" leftValue={leftTimesheet.totalHours} rightValue={rightTimesheet.totalHours} />
      <ComparisonCard title="Total Consulting Hours" leftValue={leftTimesheet.totalConsultingHours} rightValue={rightTimesheet.totalConsultingHours} />
      <ComparisonCard title="Total Squad Hours" leftValue={leftTimesheet.totalSquadHours} rightValue={rightTimesheet.totalSquadHours} />
      <ComparisonCard title="Total Internal Hours" leftValue={leftTimesheet.totalInternalHours} rightValue={rightTimesheet.totalInternalHours} />
      <ComparisonCard title="Total Hands-On Hours" leftValue={leftTimesheet.totalHandsOnHours} rightValue={rightTimesheet.totalHandsOnHours} />
      <ComparisonCard title="Unique Clients" leftValue={leftTimesheet.uniqueClients} rightValue={rightTimesheet.uniqueClients} />
      <ComparisonCard title="Unique Workers" leftValue={leftTimesheet.uniqueWorkers} rightValue={rightTimesheet.uniqueWorkers} />
      <ComparisonCard title="Unique Working Days" leftValue={leftTimesheet.uniqueWorkingDays} rightValue={rightTimesheet.uniqueWorkingDays} />
    </div>
  );
};

export default TimesheetComparison;
