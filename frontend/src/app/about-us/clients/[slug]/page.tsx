"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GET_CLIENT_BY_SLUG, GET_CLIENT_TIMESHEET } from "./queries";
import { ClientHeader } from "./ClientHeader";
import { Divider } from "@/components/catalyst/divider";
import { CasesGallery } from "../../cases/CasesGallery";
import { AllocationSection } from "./AllocationSection";
import { AllocationCalendar } from "@/app/components/AllocationCalendar";
import SectionHeader from "@/components/SectionHeader";

export default function ClientPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDataset, setSelectedDataset] = useState<string>(
    "timesheet-last-six-weeks"
  );
  const [selectedStat, setSelectedStat] = useState("total");

  // Calendar states for current month
  const [selectedDateCurr, setSelectedDateCurr] = useState(new Date());
  const [selectedDayCurr, setSelectedDayCurr] = useState<number | null>(null);
  const [selectedRowCurr, setSelectedRowCurr] = useState<number | null>(null);
  const [selectedColumnCurr, setSelectedColumnCurr] = useState<number | null>(null);
  const [isAllSelectedCurr, setIsAllSelectedCurr] = useState(false);

  // Calendar states for previous month
  const [selectedDatePrev, setSelectedDatePrev] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );
  const [selectedDayPrev, setSelectedDayPrev] = useState<number | null>(null);
  const [selectedRowPrev, setSelectedRowPrev] = useState<number | null>(null);
  const [selectedColumnPrev, setSelectedColumnPrev] = useState<number | null>(null);
  const [isAllSelectedPrev, setIsAllSelectedPrev] = useState(false);

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

  const currentMonthDataset = getVisibleDates(selectedDateCurr);
  const previousMonthDataset = getVisibleDates(selectedDatePrev);

  const {
    data: clientData,
    loading: clientLoading,
    error: clientError,
  } = useQuery(GET_CLIENT_BY_SLUG, {
    variables: { 
      slug,
      dataset1: previousMonthDataset,
      dataset2: currentMonthDataset
    },
  });

  const {
    data: timesheetData,
    loading: timesheetLoading,
    error: timesheetError,
  } = useQuery(GET_CLIENT_TIMESHEET, {
    variables: {
      clientName: clientData?.client?.name,
      datasetSlug: selectedDataset,
    },
    skip: !selectedDataset || !clientData?.client?.name,
  });

  useEffect(() => {
    const datasetParam = searchParams.get("dataset");
    if (datasetParam) {
      setSelectedDataset(datasetParam);
    }
  }, [searchParams]);

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    router.push(`/about-us/clients/${slug}?dataset=${value}`);
  };

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName === selectedStat ? "total" : statName);
  };

  if (clientLoading) return <p>Loading client data...</p>;
  if (clientError) return <p>Error loading client: {clientError.message}</p>;
  if (!clientData?.client) return <p>No client data found</p>;

  const { timesheet1, timesheet2 } = clientData.client;

  return (
    <div>
      <ClientHeader client={clientData.client} />

      <SectionHeader title="Side by Side Analysis" subtitle="" />
      
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
              timesheet={timesheet1}
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
              timesheet={timesheet2}
            />
          </div>
        </div>
      </div>

      <AllocationSection
        selectedDataset={selectedDataset}
        onDatasetSelect={handleDatasetSelect}
        timesheetData={timesheetData}
        timesheetLoading={timesheetLoading}
        timesheetError={timesheetError}
        selectedStat={selectedStat}
        handleStatClick={handleStatClick}
      />

    </div>
  );
}
