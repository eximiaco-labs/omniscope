"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GET_CASE_BY_SLUG } from "./queries";
import { CaseHeader } from "./CaseHeader";
import { CaseTimeline } from "./CaseTimeline";
import { WeeklyHoursTable } from "./WeeklyHoursTable";
import { AllocationCalendar } from "@/app/components/AllocationCalendar";
import SectionHeader from "@/components/SectionHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrackingProjects } from "./TrackingProjects";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StatType } from "@/app/constants/colors";

interface WorkerSummary {
  worker: string;
  workerSlug: string;
  hours: number;
  appointments: any[];
}

const SummarySection = ({
  summaries,
  selectedStatType,
  dataset,
}: {
  summaries: WorkerSummary[] | null;
  selectedStatType: StatType;
  dataset: string;
}) => {
  if (!summaries) return null;

  const filteredSummaries = summaries.filter((summary) => summary.hours > 0);

  if (filteredSummaries.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Worker Summary:</h3>
      {filteredSummaries.map((summary) => (
        <div
          key={summary.worker}
          className="flex justify-between items-center py-1"
        >
          <Link
            href={`/about-us/consultants-and-engineers/${summary.workerSlug}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {summary.worker}
          </Link>
          <div className="flex items-center gap-4">
            <span>{summary.hours.toFixed(1)}h</span>
            <Sheet>
              <SheetTrigger className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Details
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    {summary.worker} -{" "}
                    {selectedStatType.charAt(0).toUpperCase() +
                      selectedStatType.slice(1)}{" "}
                    Hours ({dataset})
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Hours</TableHead>
                        <TableHead className="text-xs">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.appointments
                        .filter(
                          (apt) =>
                            apt.kind.toLowerCase() ===
                              selectedStatType.toLowerCase() ||
                            (selectedStatType === "handsOn" &&
                              apt.kind.toLowerCase() === "handson")
                        )
                        .map((apt, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-xs">
                              {apt.date}
                            </TableCell>
                            <TableCell className="text-xs">
                              {apt.timeInHs}h
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">
                              {apt.comment}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CasePage() {
  const { slug } = useParams();

  // Calculate visible dates for both datasets
  const getVisibleDates = (date: Date) => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const firstVisibleDate = new Date(
      currentYear,
      currentMonth,
      -startingDayOfWeek + 1
    );

    const daysInMonth = lastDayOfMonth.getDate();
    const totalDays = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    const remainingDays = weeksNeeded * 7 - (startingDayOfWeek + daysInMonth);

    const lastVisibleDate = new Date(
      currentYear,
      currentMonth + 1,
      remainingDays
    );

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;
    };

    return `${formatDate(firstVisibleDate)}-${formatDate(lastVisibleDate)}`;
  };

  // Previous month states
  const [selectedDatePrev, setSelectedDatePrev] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );
  const [selectedDayPrev, setSelectedDayPrev] = useState<number | null>(null);
  const [selectedRowPrev, setSelectedRowPrev] = useState<number | null>(null);
  const [selectedColumnPrev, setSelectedColumnPrev] = useState<number | null>(
    null
  );
  const [isAllSelectedPrev, setIsAllSelectedPrev] = useState(false);
  const [selectedStatTypePrev, setSelectedStatTypePrev] =
    useState<StatType>("consulting");

  // Current month states
  const [selectedDateCurr, setSelectedDateCurr] = useState(new Date());
  const [selectedDayCurr, setSelectedDayCurr] = useState<number | null>(null);
  const [selectedRowCurr, setSelectedRowCurr] = useState<number | null>(null);
  const [selectedColumnCurr, setSelectedColumnCurr] = useState<number | null>(
    null
  );
  const [isAllSelectedCurr, setIsAllSelectedCurr] = useState(false);
  const [selectedStatTypeCurr, setSelectedStatTypeCurr] =
    useState<StatType>("consulting");

  const currentMonthDataset = getVisibleDates(selectedDateCurr);
  const previousMonthDataset = getVisibleDates(selectedDatePrev);

  const { loading, error, data } = useQuery(GET_CASE_BY_SLUG, {
    variables: {
      slug,
      dataset1: previousMonthDataset,
      dataset2: currentMonthDataset,
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const caseItem = data.case;
  const byKind = caseItem.timesheets?.lastSixWeeks?.byKind || {};

  // Generate worker summaries from timesheet data
  const getSelectedSummary = (
    timesheet: any,
    selectedDay: number | null,
    selectedRow: number | null,
    selectedColumn: number | null,
    isAllSelected: boolean,
    selectedDate: Date,
    selectedStatType: StatType
  ): WorkerSummary[] | null => {
    if (
      !timesheet?.appointments ||
      (!selectedDay && !selectedRow && !selectedColumn && !isAllSelected)
    )
      return null;

    const workerSummaryData: { [key: string]: WorkerSummary } = {};

    timesheet.appointments.forEach((appointment: any) => {
      const appointmentDate = new Date(appointment.date);
      const dayOfMonth = appointmentDate.getUTCDate();
      const dayOfWeek = appointmentDate.getUTCDay();
      const appointmentMonth = appointmentDate.getUTCMonth();

      const firstDayOfMonth = new Date(
        appointmentDate.getUTCFullYear(),
        appointmentDate.getUTCMonth(),
        1
      );
      const firstDayOffset = firstDayOfMonth.getUTCDay();
      const weekIndex = Math.floor((dayOfMonth + firstDayOffset - 1) / 7);

      const shouldInclude =
        (isAllSelected ||
          (selectedDay !== null && dayOfMonth === selectedDay) ||
          (selectedRow !== null && weekIndex === selectedRow) ||
          (selectedColumn !== null && dayOfWeek === selectedColumn)) &&
        appointmentMonth === selectedDate.getMonth();

      if (shouldInclude) {
        const workerKey = appointment.workerName;
        if (!workerKey) return;

        if (!workerSummaryData[workerKey]) {
          workerSummaryData[workerKey] = {
            worker: appointment.workerName,
            workerSlug: appointment.workerSlug,
            hours: 0,
            appointments: [],
          };
        }

        if (
          appointment.kind.toLowerCase() === selectedStatType.toLowerCase() ||
          (selectedStatType === "handsOn" &&
            appointment.kind.toLowerCase() === "handson")
        ) {
          workerSummaryData[workerKey].hours += appointment.timeInHs;

          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const formattedAppointment = {
            ...appointment,
            date: `${
              days[appointmentDate.getUTCDay()]
            } ${appointmentDate.getUTCDate()}`,
          };
          workerSummaryData[workerKey].appointments.push(formattedAppointment);
        }
      }
    });

    return Object.values(workerSummaryData)
      .filter((summary) => summary.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  };

  const prevSummaries = getSelectedSummary(
    caseItem.timesheet1,
    selectedDayPrev,
    selectedRowPrev,
    selectedColumnPrev,
    isAllSelectedPrev,
    selectedDatePrev,
    selectedStatTypePrev
  );

  const currSummaries = getSelectedSummary(
    caseItem.timesheet2,
    selectedDayCurr,
    selectedRowCurr,
    selectedColumnCurr,
    isAllSelectedCurr,
    selectedDateCurr,
    selectedStatTypeCurr
  );

  // Generate last 6 weeks dates with start and end dates
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() - 7 * (6 - i));
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return {
      start: startDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      end: endDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    };
  });

  return (
    <div>
      <CaseHeader caseItem={caseItem} />
      <TrackingProjects
          tracker={caseItem.tracker}
          workersByTrackingProject={
            caseItem.timesheets.lastSixWeeks.byCase?.[0]
              ?.workersByTrackingProject || []
          }
      />

      <div className="mt-4">
        <SectionHeader title="Side by Side Analysis" subtitle="" />
      </div>
      <div className="ml-2 mr-2">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <AllocationCalendar
              selectedDate={selectedDatePrev}
              setSelectedDate={setSelectedDatePrev}
              selectedDay={selectedDayPrev}
              setSelectedDay={setSelectedDayPrev}
              selectedRow={selectedRowPrev}
              setSelectedRow={setSelectedRowPrev}
              selectedColumn={selectedColumnPrev}
              setSelectedColumn={setSelectedColumnPrev}
              isAllSelected={isAllSelectedPrev}
              setIsAllSelected={setIsAllSelectedPrev}
              timesheet={caseItem.timesheet1}
              selectedStatType={selectedStatTypePrev}
              setSelectedStatType={setSelectedStatTypePrev}
            />
            <SummarySection
              summaries={prevSummaries}
              selectedStatType={selectedStatTypePrev}
              dataset="Last Month"
            />
          </div>
          <div>
            <AllocationCalendar
              selectedDate={selectedDateCurr}
              setSelectedDate={setSelectedDateCurr}
              selectedDay={selectedDayCurr}
              setSelectedDay={setSelectedDayCurr}
              selectedRow={selectedRowCurr}
              setSelectedRow={setSelectedRowCurr}
              selectedColumn={selectedColumnCurr}
              setSelectedColumn={setSelectedColumnCurr}
              isAllSelected={isAllSelectedCurr}
              setIsAllSelected={setIsAllSelectedCurr}
              timesheet={caseItem.timesheet2}
              selectedStatType={selectedStatTypeCurr}
              setSelectedStatType={setSelectedStatTypeCurr}
            />
            <SummarySection
              summaries={currSummaries}
              selectedStatType={selectedStatTypeCurr}
              dataset="Current Month"
            />
          </div>
        </div>
      </div>

      {caseItem.updates && caseItem.updates.length > 0 && (
        <div className="mt-8 mb-8">
          <SectionHeader title="Case Updates" subtitle="" />
          <div className="ml-4 mr-4">
            <CaseTimeline updates={caseItem.updates} />
          </div>
        </div>
      )}
    </div>
  );
}
