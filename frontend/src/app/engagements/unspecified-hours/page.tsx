"use client";

import React, { useState, useMemo } from "react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { gql, useQuery } from "@apollo/client";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const TIMESHEET_QUERY = gql`
  query Timesheet($slug: String!, $filters: [DatasetFilterInput]) {
    timesheet(slug: $slug, filters: $filters) {
      filterableFields {
        field
        options
        selectedValues
      }
      appointments {
        data {
          date
          consultantOrEngineer { name, slug }
          client { name, slug }
          accountManager { name, slug }
          timeInHs
          comment
        }
      }
    }
  }
`;

type SortField =
  | "percentage"
  | "count"
  | "total"
  | "name"
  | "unspecifiedHours"
  | "totalHours"
  | "hoursPercentage";

interface WorkerStats {
  count: number;
  slug: string;
  total: number;
  unspecifiedHours: number;
  totalHours: number;
  appointments?: Array<{
    date: string;
    clientName: string;
    clientSlug: string;
    timeInHs: number;
  }>;
}

interface WorkerStatsWithPercentages extends WorkerStats {
  worker: string;
  percentage: number;
  hoursPercentage: number;
}

interface Stats {
  total: number;
  unspecified: number;
  percentage: number;
  byWorker: Record<string, WorkerStats>;
}

interface Appointment {
  date: string;
  consultantOrEngineer: {
    name: string;
    slug: string;
  };
  client: {
    name: string;
    slug: string;
  };
  accountManager: {
    name: string;
    slug: string;
  };
  timeInHs: number;
  comment: string;
}

export default function UnspecifiedWorkHoursPage() {
  const client = useEdgeClient();
  const router = useRouter();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState({
    from: firstDayOfMonth,
    to: today,
  });

  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  const [sortField, setSortField] = useState<SortField>("percentage");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const slug = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return "";
    return `timesheet-${format(dateRange.from, "dd-MM-yyyy")}-${format(
      dateRange.to,
      "dd-MM-yyyy"
    )}`;
  }, [dateRange]);

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.timesheet?.filterableFields?.reduce((acc: any[], field: any) => {
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
      }, []) || [];

    setFormattedSelectedValues(formattedValues);
  };

  const { data, loading, error, refetch } = useQuery(TIMESHEET_QUERY, {
    variables: {
      slug,
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    client: client ?? undefined,
    skip: !slug,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const stats = useMemo(() => {
    if (!data?.timesheet?.appointments?.data) return null;

    const appointments = data.timesheet.appointments.data as Appointment[];
    const total = appointments.length;
    const unspecified = appointments.filter((a: Appointment) => !a.comment).length;
    const percentage = (unspecified / total) * 100;

    const byWorker = appointments.reduce<Record<string, WorkerStats>>(
      (acc: Record<string, WorkerStats>, curr: Appointment) => {
        const workerName = curr.consultantOrEngineer.name;
        if (!acc[workerName]) {
          acc[workerName] = {
            count: 0,
            total: 0,
            unspecifiedHours: 0,
            totalHours: 0,
            slug: curr.consultantOrEngineer.slug,
            appointments: [],
          };
        }

        acc[workerName].total += 1;
        acc[workerName].totalHours += curr.timeInHs;
        if (!curr.comment) {
          acc[workerName].count += 1;
          acc[workerName].unspecifiedHours += curr.timeInHs;
          acc[workerName].appointments?.push({
            date: curr.date,
            clientName: curr.client.name,
            clientSlug: curr.client.slug,
            timeInHs: curr.timeInHs,
          });
        }

        return acc;
      },
      {}
    );

    return { total, unspecified, percentage, byWorker } as Stats;
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!stats) return null;

  const totalUnspecifiedHours = Object.values(stats.byWorker).reduce(
    (sum, worker) => sum + worker.unspecifiedHours,
    0
  );

  const totalHours = Object.values(stats.byWorker).reduce(
    (sum, worker) => sum + worker.totalHours,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <DateRangePicker
            date={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onDateRangeChange={(newDateRange) => {
              if (newDateRange) {
                setDateRange({
                  from: newDateRange.from || dateRange.from,
                  to: newDateRange.to || dateRange.to,
                });
              }
            }}
          />
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <FilterFieldsSelect
          data={data?.timesheet}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>

      <div className="ml-2 mr-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-4">
            <p className="text-blue-800">
              <InfoCircledIcon className="inline-block mr-2 h-4 w-4 text-blue-600" />
              An entry is considered "unspecified" when there is a time entry in Everhour without any comments. 
              These entries need attention as they lack important context about the work performed.
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid gap-6">
            {Object.keys(stats.byWorker).length > 0 && (
              <>
                <SectionHeader
                  title="Unspecified Entries"
                  subtitle="by Worker"
                />
                <Table>
                  <TableHeader>
                    <TableRow className="divide-x divide-gray-200">
                      <TableHead className="w-[50px] text-center">#</TableHead>
                      <TableHead
                        onClick={() => handleSort("name")}
                        className="cursor-pointer"
                      >
                        Worker{" "}
                        {sortField === "name" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("count")}
                        className="text-right cursor-pointer w-[120px]"
                      >
                        Unspecified Entries{" "}
                        {sortField === "count" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("total")}
                        className="text-right cursor-pointer w-[120px]"
                      >
                        Total Entries{" "}
                        {sortField === "total" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("percentage")}
                        className="text-right cursor-pointer w-[60px]"
                      >
                        %{" "}
                        {sortField === "percentage" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("unspecifiedHours")}
                        className="text-right cursor-pointer w-[120px]"
                      >
                        Unspecified Hours{" "}
                        {sortField === "unspecifiedHours" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("totalHours")}
                        className="text-right cursor-pointer w-[120px]"
                      >
                        Total Hours{" "}
                        {sortField === "totalHours" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("hoursPercentage")}
                        className="text-right cursor-pointer w-[60px]"
                      >
                        Hours %{" "}
                        {sortField === "hoursPercentage" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Object.entries(stats.byWorker) as [string, WorkerStats][])
                      .filter(([, data]) => data.count > 0)
                      .map(([worker, data]): WorkerStatsWithPercentages => ({
                        worker,
                        ...data,
                        percentage: (data.count / data.total) * 100,
                        hoursPercentage:
                          (data.unspecifiedHours / data.totalHours) * 100,
                      }))
                      .sort((a, b) => {
                        const modifier = sortDirection === "asc" ? 1 : -1;
                        if (sortField === "percentage")
                          return (a.percentage - b.percentage) * modifier;
                        if (sortField === "count")
                          return (a.count - b.count) * modifier;
                        if (sortField === "total")
                          return (a.total - b.total) * modifier;
                        if (sortField === "unspecifiedHours")
                          return (
                            (a.unspecifiedHours - b.unspecifiedHours) * modifier
                          );
                        if (sortField === "totalHours")
                          return (a.totalHours - b.totalHours) * modifier;
                        if (sortField === "hoursPercentage")
                          return (
                            (a.hoursPercentage - b.hoursPercentage) * modifier
                          );
                        return modifier * a.worker.localeCompare(b.worker);
                      })
                      .map((data, index) => (
                        <TableRow
                          key={data.worker}
                          className="divide-x divide-gray-200 h-[57px]"
                        >
                          <TableCell className="text-center text-gray-500 text-[10px]">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/about-us/consultants-and-engineers/${data.slug}`}
                              className="text-blue-600 hover:underline"
                            >
                              {data.worker}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right relative">
                            <Sheet>
                              <SheetTrigger className="text-blue-600 hover:underline">
                                {data.count}
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>
                                    {data.worker}
                                  </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {data.appointments?.map((apt, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell>{format(new Date(apt.date), "MMMM dd, yyyy")}</TableCell>
                                          <TableCell>
                                            <Link
                                              href={`/about-us/clients/${apt.clientSlug}`}
                                              className="text-blue-600 hover:underline"
                                            >
                                              {apt.clientName}
                                            </Link>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {apt.timeInHs.toFixed(1)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </SheetContent>
                            </Sheet>
                            <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
                              {(data.count / stats.unspecified * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {data.total}
                          </TableCell>
                          <TableCell className="text-right">
                            {data.percentage.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right relative">
                            {data.unspecifiedHours.toFixed(1)}
                            <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
                              {(data.unspecifiedHours / totalUnspecifiedHours * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {data.totalHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            {data.hoursPercentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="divide-x divide-gray-200">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right">
                        {stats.unspecified}
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {stats.total}
                      </TableCell> */}
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-right">
                        {totalUnspecifiedHours.toFixed(1)}
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {totalHours.toFixed(1)}
                      </TableCell> */}
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
