import React from "react";

interface Week {
  start: string;
  end: string;
}

interface WeeklyHour {
  week: string;
  hours: number;
}

interface Worker {
  name: string;
  weeklyHours: WeeklyHour[];
}

interface WeeklyHoursTableProps {
  weeks: Week[];
  consultingWorkers: Worker[];
}

export function WeeklyHoursTable({ weeks, consultingWorkers }: WeeklyHoursTableProps) {
  // Calculate weekly totals
  const weeklyTotals = weeks.map((week) => {
    return consultingWorkers.reduce((total: number, worker: Worker) => {
      const hours = worker.weeklyHours.find(wh => wh.week === `${week.start} - ${week.end}`)?.hours || 0;
      return total + hours;
    }, 0);
  });

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b w-48">
              Worker
            </th>
            {weeks.map((week) => (
              <th 
                key={`${week.start}-${week.end}`}
                scope="col"
                className="py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b w-32"
              >
                {week.start} - {week.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {consultingWorkers.map((worker) => {
            return (
              <tr key={worker.name} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {worker.name}
                </td>
                {weeks.map((week) => {
                  const hours = worker.weeklyHours.find(wh => wh.week === `${week.start} - ${week.end}`)?.hours || 0;
                  return (
                    <td key={`${week.start}-${week.end}`} className="py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {consultingWorkers.length > 1 && (
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                Total
              </td>
              {weeklyTotals.map((total, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                  {total % 1 === 0 ? total.toFixed(0) : total.toFixed(1)}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
