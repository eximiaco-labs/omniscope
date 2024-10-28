import React from "react";

interface WeekRange {
  start: string;
  end: string;
}

interface Worker {
  worker: {
    name: string;
  };
  byWeek: {
    week: string;
    hours: number;
  }[];
}

interface WeeklyHoursTableProps {
  weeks: WeekRange[];
  workers: Worker[];
}

export function WeeklyHoursTable({ weeks, workers }: WeeklyHoursTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Worker
            </th>
            {weeks.map((week, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {week.start} - {week.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workers.map((worker, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {worker.worker.name}
              </td>
              {weeks.map((week, weekIndex) => {
                const weekData = worker.byWeek.find(w => 
                  w.week.startsWith(week.start)
                );
                return (
                  <td
                    key={weekIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {weekData ? weekData.hours.toFixed(1) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
