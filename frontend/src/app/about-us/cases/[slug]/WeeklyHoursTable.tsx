import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48">Worker</TableHead>
          {weeks.map((week) => (
            <TableHead 
              key={`${week.start}-${week.end}`}
              className="w-32 text-center"
            >
              {week.start} - {week.end}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {consultingWorkers.map((worker) => {
          return (
            <TableRow key={worker.name}>
              <TableCell className="font-medium">
                {worker.name}
              </TableCell>
              {weeks.map((week) => {
                const hours = worker.weeklyHours.find(wh => wh.week === `${week.start} - ${week.end}`)?.hours || 0;
                return (
                  <TableCell key={`${week.start}-${week.end}`} className="text-center">
                    {hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
        {consultingWorkers.length > 1 && (
          <TableRow>
            <TableCell className="font-medium">
              Total
            </TableCell>
            {weeklyTotals.map((total, index) => (
              <TableCell key={index} className="text-center font-medium">
                {total % 1 === 0 ? total.toFixed(0) : total.toFixed(1)}
              </TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
