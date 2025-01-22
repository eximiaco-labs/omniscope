"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { TIMELINESS_REVIEW_QUERY } from "./query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/DatePicker";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { FilterFieldsSelect } from "../../components/FilterFieldsSelect";
import { format } from "date-fns";
import SectionHeader from "@/components/SectionHeader";
import { NavBar } from "../../components/NavBar";
import Link from "next/link";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

interface Worker {
  consultantOrEngineer: {
    slug: string;
    name: string;
  };
  timeInHours: number;
  entries: number;
}

interface WorkerSection {
  data: Worker[];
}

const sections = [
  { id: 'early', title: 'Early Submissions', subtitle: '0%' },
  { id: 'ok', title: 'On-Time Submissions', subtitle: '0%' },
  { id: 'acceptable', title: 'Acceptable Submissions', subtitle: '0%' },
  { id: 'late', title: 'Late Submissions', subtitle: '0%' },
]

export default function TimelinessReviewPage() {
  const client = useEdgeClient();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);
  const [sortConfigs, setSortConfigs] = useState({
    early: { key: "timeInHours", direction: "desc" as "asc" | "desc" },
    ok: { key: "timeInHours", direction: "desc" as "asc" | "desc" },
    acceptable: { key: "timeInHours", direction: "desc" as "asc" | "desc" },
    late: { key: "timeInHours", direction: "desc" as "asc" | "desc" },
  });
  const [sectionsWithPercentages, setSectionsWithPercentages] = useState(sections);

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { data, loading, error } = useQuery(TIMELINESS_REVIEW_QUERY, {
    variables: {
      date_of_interest: format(date, "yyyy-MM-dd"),
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    client: client ?? undefined,
    ssr: true
  });

  const timelinessData = data?.engagements?.summaries?.timeliness;

  useEffect(() => {
    if (timelinessData) {
      // Calculate total hours across all sections
      const allSectionsHours = sections.reduce((total, section) => {
        return total + timelinessData[`${section.id}Workers`].data.reduce(
          (sum: number, worker: any) => sum + worker.timeInHours,
          0
        );
      }, 0);

      // Update sections with percentages
      const updatedSections = sections.map(section => {
        const sectionHours = timelinessData[`${section.id}Workers`].data.reduce(
          (sum: number, worker: any) => sum + worker.timeInHours,
          0
        );
        const percentage = ((sectionHours / allSectionsHours) * 100).toFixed(1);
        return {
          ...section,
          subtitle: `${percentage}%`
        };
      });

      setSectionsWithPercentages(updatedSections);
    }
  }, [data]);

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      timelinessData?.filterableFields?.reduce(
        (acc: any[], field: any) => {
          const fieldValues = newSelectedValues
            .filter(
              (v) =>
                typeof v.value === "string" &&
                v.value.startsWith(`${field.field}:`)
            )
            .map((v) => (v.value as string).split(":")[1]);

          if (fieldValues.length > 0) {
            acc.push({
              field: field.field,
              selectedValues: fieldValues,
            });
          }
          return acc;
        },
        []
      ) || [];

    setFormattedSelectedValues(formattedValues);
  };

  const sortData = (
    workers: any[],
    key: string,
    tableType: "early" | "ok" | "acceptable" | "late"
  ) => {
    const sortConfig = sortConfigs[tableType];
    if (!sortConfig || sortConfig.key !== key) return workers;

    const sortedWorkers = [...workers].sort((a, b) => {
      if (key === "worker") {
        const aName = a.consultantOrEngineer.name;
        const bName = b.consultantOrEngineer.name;
        if (aName < bName) return sortConfig.direction === "asc" ? -1 : 1;
        if (aName > bName) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
      if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortedWorkers;
  };

  const requestSort = (
    key: string,
    tableType: "early" | "ok" | "acceptable" | "late"
  ) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfigs[tableType].key === key &&
      sortConfigs[tableType].direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfigs({
      ...sortConfigs,
      [tableType]: { key, direction },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const renderWorkerTable = (
    workersData: WorkerSection,
    title: string,
    tableType: "early" | "ok" | "acceptable" | "late"
  ) => {
    const workers = workersData.data;
    const sortConfig = sortConfigs[tableType];
    const sortedWorkers = sortData(workers, sortConfig.key, tableType);
    const totalHours = workers.reduce(
      (sum: number, worker: Worker) => sum + worker.timeInHours,
      0
    );
    const totalEntries = workers.reduce(
      (sum: number, worker: Worker) => sum + worker.entries,
      0
    );

    // Calculate total hours across all sections
    const allSectionsHours = sections.reduce((total, section) => {
      return total + timelinessData[`${section.id}Workers`].data.reduce(
        (sum: number, worker: any) => sum + worker.timeInHours,
        0
      );
    }, 0);

    // Calculate percentage of total hours
    const percentageOfTotal = ((totalHours / allSectionsHours) * 100).toFixed(1);

    return (
      <div id={tableType} className="mt-4 scroll-mt-[68px] sm:scroll-mt-[68px]">
        <SectionHeader title={title} subtitle={`${percentageOfTotal}% of total hours`} />
        <div className="ml-2 mr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead
                  className="cursor-pointer w-[calc(100%-300px)]"
                  onClick={() => requestSort("worker", tableType)}
                >
                  Worker{" "}
                  {sortConfig.key === "worker" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[125px] text-right"
                  onClick={() => requestSort("timeInHours", tableType)}
                >
                  Time (Hours){" "}
                  {sortConfig.key === "timeInHours" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[125px] text-right"
                  onClick={() => requestSort("entries", tableType)}
                >
                  Entries{" "}
                  {sortConfig.key === "entries" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWorkers.map((worker, index) => (
                <TableRow key={index} className="h-[57px]">
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="w-[calc(100%-300px)]">
                    <Link href={`/about-us/consultants-and-engineers/${worker.consultantOrEngineer.slug}`} className="text-blue-600 hover:text-blue-800">
                      {worker.consultantOrEngineer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="w-[125px] text-right relative">
                    {worker.timeInHours.toFixed(2)}
                    <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
                      {((worker.timeInHours / totalHours) * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="w-[125px] text-right relative">
                    {worker.entries}
                    <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
                      {((worker.entries / totalEntries) * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold h-[57px]">
                <TableCell></TableCell>
                <TableCell className="w-[calc(100%-300px)]">Total</TableCell>
                <TableCell className="w-[125px] text-right">
                  {totalHours.toFixed(2)}
                </TableCell>
                <TableCell className="w-[125px] text-right">
                  {totalEntries}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="relative z-[40]">
        <div className="mb-2 flex items-center">
          <DatePicker date={date} onSelectedDateChange={setDate} />
          <div className="flex-grow h-px bg-gray-200 ml-4"></div>
        </div>

        <div className="mb-4">
          <FilterFieldsSelect
            data={timelinessData}
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <NavBar sections={sectionsWithPercentages} />

      <div className="ml-2 mr-2">
        {sections.map((section) => (
          <div
            key={section.id}
            id={section.id}
            className="mt-4 scroll-mt-[68px] sm:scroll-mt-[68px]"
          >
            {renderWorkerTable(
              timelinessData[`${section.id}Workers`],
              section.title,
              section.id as "early" | "ok" | "acceptable" | "late"
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
