"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { CONSULTING_HOURS_QUERY } from "./query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

interface Project {
  name: string;
  hours: number;
  percentage: number;
}

interface Consultant {
  id: number;
  name: string;
  slug: string;
  totalHours: number;
  percentage: number;
  projects: {
    data: Project[];
  };
}

interface ConsultingHoursData {
  startDate: string;
  endDate: string;
  totalHours: number;
  consultants: {
    data: Consultant[];
  };
  filterableFields: Array<{
    field: string;
    options: string[];
    selectedValues: string[];
  }>;
}

export default function ConsultingHoursPage() {
  const client = useEdgeClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), // First day of previous month
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0), // Last day of previous month
  });
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);
  const [sortConfig, setSortConfig] = useState({
    key: "totalHours",
    direction: "desc" as "asc" | "desc",
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const { data, loading, error } = useQuery(CONSULTING_HOURS_QUERY, {
    variables: {
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    client: client ?? undefined,
    ssr: true,
    skip: !dateRange?.from || !dateRange?.to,
  });

  const consultingHoursData: ConsultingHoursData =
    data?.engagements?.summaries?.consultingHours;

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      consultingHoursData?.filterableFields?.reduce(
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

  const sortData = (consultants: Consultant[], key: string) => {
    if (sortConfig.key !== key) return consultants;

    const sortedConsultants = [...consultants].sort((a, b) => {
      if (key === "name") {
        if (a.name < b.name) return sortConfig.direction === "asc" ? -1 : 1;
        if (a.name > b.name) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
      if (key === "totalHours") {
        const aValue = a.totalHours;
        const bValue = b.totalHours;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
      if (a[key as keyof Consultant] < b[key as keyof Consultant])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[key as keyof Consultant] > b[key as keyof Consultant])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortedConsultants;
  };

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleRowExpansion = (consultantId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(consultantId)) {
      newExpandedRows.delete(consultantId);
    } else {
      newExpandedRows.add(consultantId);
    }
    setExpandedRows(newExpandedRows);
  };

  const renderConsultantTable = () => {
    if (!consultingHoursData) return null;

    const consultants = consultingHoursData.consultants.data;
    const sortedConsultants = sortData(consultants, sortConfig.key);
    const totalHours = consultingHoursData.totalHours;

    return (
      <div
        id="consultants"
        className="mt-4 scroll-mt-[68px] sm:scroll-mt-[68px]"
      >
        <SectionHeader
          title="Consulting Hours Report"
          subtitle={
            dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
                  dateRange.to,
                  "MMM dd, yyyy"
                )}`
              : "Select date range"
          }
        />
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead
                  className="cursor-pointer w-[calc(100%-500px)]"
                  onClick={() => requestSort("name")}
                >
                  Consultant{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  Projects
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[125px] text-right"
                  onClick={() => requestSort("totalHours")}
                >
                  Total Hours{" "}
                  {sortConfig.key === "totalHours" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[125px] text-right"
                  onClick={() => requestSort("percentage")}
                >
                  Percentage{" "}
                  {sortConfig.key === "percentage" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="w-[100px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedConsultants.map((consultant, index) => (
                <React.Fragment key={consultant.id}>
                  <TableRow className="h-[57px]">
                    <TableCell className="text-center text-gray-500 text-[10px]">
                      {index + 1}
                    </TableCell>
                    <TableCell className="w-[calc(100%-500px)]">
                      <Link
                        href={`/about-us/consultants-and-engineers/${consultant.slug}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {consultant.name}
                      </Link>
                    </TableCell>
                    <TableCell className="w-[100px] text-center">
                      <span className="text-sm text-gray-600">
                        {consultant.projects.data.length}
                      </span>
                    </TableCell>
                    <TableCell className="w-[125px] text-right relative">
                      {consultant.totalHours.toFixed(2)}
                      <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
                        {((consultant.totalHours / totalHours) * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </TableCell>
                    <TableCell className="w-[125px] text-right">
                      {((consultant.totalHours / 160) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="w-[100px] text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleRowExpansion(consultant.id)}
                      >
                        {expandedRows.has(consultant.id) ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(consultant.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="bg-gray-50 p-4 w-full">
                          {consultant.projects.data.length > 0 ? (
                            <div className="space-y-2 w-full">
                              {consultant.projects.data.map((project, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center w-full"
                                >
                                  <div className="flex-1 min-w-0 mr-4">
                                    <div className="font-medium text-sm text-gray-900">
                                      {project.name}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-8 text-sm text-gray-600 flex-shrink-0">
                                    <div className="text-right">
                                      <div className="font-medium">
                                        {project.hours.toFixed(1)}h
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {(
                                          (project.hours /
                                            consultant.totalHours) *
                                          100
                                        ).toFixed(1)}
                                        % of total
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        {((project.hours / 160) * 100).toFixed(
                                          1
                                        )}
                                        %
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        of 160h
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No projects found
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      <div className="relative z-[40]">
        <div className="mb-2 flex items-center">
          <DateRangePicker
            date={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          <div className="flex-grow h-px bg-gray-200 ml-4"></div>
        </div>
      </div>

      <div>{renderConsultantTable()}</div>
    </div>
  );
}
