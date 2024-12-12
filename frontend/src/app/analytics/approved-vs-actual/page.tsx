"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Heading } from "@/components/catalyst/heading";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { LittleStat, Stat } from "@/app/components/analytics/stat";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

const APPROVED_VS_ACTUAL_QUERY = gql`
  query ApprovedVsActual($start: Date!, $end: Date!) {
    approvedVsActual(start: $start, end: $end) {
      start
      end
      numberOfCases
      totalApprovedHours
      totalActualHours
      totalDifference
      cases {
        id
        title
        preContractedValue
        startOfContract
        endOfContract
        weeklyApprovedHours
        totalApprovedHours
        totalActualHours
        totalDifference
        weeks {
          title
          actualHours
          approvedHours
          difference
        }
      }
    }
  }
`;

export default function ApprovedVsActualPage() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState({
    from: firstDayOfMonth,
    to: today,
  });

  const [regularSortConfig, setRegularSortConfig] = useState({
    key: "totalDifference",
    direction: "asc" as "asc" | "desc",
  });

  const [preSortConfig, setPreSortConfig] = useState({
    key: "totalDifference",
    direction: "asc" as "asc" | "desc",
  });

  const { loading, error, data, refetch } = useQuery(APPROVED_VS_ACTUAL_QUERY, {
    variables: {
      start: format(dateRange.from, "yyyy-MM-dd"),
      end: format(dateRange.to || dateRange.from, "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
    refetch({
      start: format(dateRange.from, "yyyy-MM-dd"),
      end: format(dateRange.to || dateRange.from, "yyyy-MM-dd"),
    });
  }, [dateRange, refetch]);

  const handleSort = (key: string, isPreContracted: boolean) => {
    const sortConfig = isPreContracted ? preSortConfig : regularSortConfig;
    const setSortConfig = isPreContracted
      ? setPreSortConfig
      : setRegularSortConfig;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedCases = (
    cases: any[],
    sortConfig: { key: string; direction: "asc" | "desc" }
  ) => {
    if (!sortConfig.key) return cases;

    return [...cases].sort((a, b) => {
      if (sortConfig.key === "weeklyApprovedHours") {
        return sortConfig.direction === "asc"
          ? a.weeklyApprovedHours - b.weeklyApprovedHours
          : b.weeklyApprovedHours - a.weeklyApprovedHours;
      }
      if (sortConfig.key === "totalApprovedHours") {
        return sortConfig.direction === "asc"
          ? a.totalApprovedHours - b.totalApprovedHours
          : b.totalApprovedHours - a.totalApprovedHours;
      }
      if (sortConfig.key === "totalActualHours") {
        return sortConfig.direction === "asc"
          ? a.totalActualHours - b.totalActualHours
          : b.totalActualHours - a.totalActualHours;
      }
      if (sortConfig.key === "totalDifference") {
        return sortConfig.direction === "asc"
          ? a.totalDifference - b.totalDifference
          : b.totalDifference - a.totalDifference;
      }
      return 0;
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const regularCases = getSortedCases(
    data?.approvedVsActual?.cases.filter(
      (caseItem: any) => !caseItem.preContractedValue
    ) || [],
    regularSortConfig
  );

  const preCases = getSortedCases(
    data?.approvedVsActual?.cases.filter(
      (caseItem: any) => caseItem.preContractedValue
    ) || [],
    preSortConfig
  );

  const renderCaseTable = (
    cases: any[],
    title: string,
    isPreContracted: boolean
  ) => {
    const sortConfig = isPreContracted ? preSortConfig : regularSortConfig;

    return (
      <div className="mt-8">
        <SectionHeader title={title} subtitle={`${cases.length} cases`} />
        <div className="ml-2 mr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Case</TableHead>
                <TableHead className="w-[300px]">Weekly Breakdown</TableHead>
                <TableHead
                  className="w-[120px] text-right cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    handleSort("weeklyApprovedHours", isPreContracted)
                  }
                >
                  Weekly Hours{" "}
                  {sortConfig.key === "weeklyApprovedHours" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="w-[100px] text-right cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    handleSort("totalApprovedHours", isPreContracted)
                  }
                >
                  Approved{" "}
                  {sortConfig.key === "totalApprovedHours" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="w-[100px] text-right cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    handleSort("totalActualHours", isPreContracted)
                  }
                >
                  Actual{" "}
                  {sortConfig.key === "totalActualHours" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="w-[100px] text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("totalDifference", isPreContracted)}
                >
                  Difference{" "}
                  {sortConfig.key === "totalDifference" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/about-us/cases/${caseItem.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {caseItem.title}
                    </Link>
                    <div className="text-xs text-gray-700 flex items-center mt-1">
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {caseItem.startOfContract && (
                          <span className="text-green-600 font-medium">
                            {new Date(caseItem.startOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {caseItem.startOfContract && caseItem.endOfContract && <span className="mx-2">→</span>}
                        {caseItem.endOfContract && (
                          <span className="text-red-600 font-medium">
                            {new Date(caseItem.endOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Table className="text-[10px]">
                      <TableHeader>
                        <TableRow className="h-6">
                          <TableHead className="py-1">Week</TableHead>
                          <TableHead className="py-1 text-right">
                            Actual
                          </TableHead>
                          <TableHead className="py-1 text-right">
                            Approved
                          </TableHead>
                          <TableHead className="py-1 text-right">
                            Diff
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caseItem.weeks.map((week: any, weekIndex: number) => (
                          <TableRow key={weekIndex} className="h-5">
                            <TableCell className="py-0.5 text-gray-600">
                              {week.title}
                            </TableCell>
                            <TableCell className="py-0.5 text-right">
                              {week.actualHours.toFixed(1)}
                            </TableCell>
                            <TableCell className="py-0.5 text-right">
                              {week.approvedHours.toFixed(1)}
                            </TableCell>
                            <TableCell
                              className={`py-0.5 text-right ${
                                week.difference < 0
                                  ? "text-red-600"
                                  : week.difference > 0
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {week.difference.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCell>
                  <TableCell className="text-right">
                    {caseItem.weeklyApprovedHours}
                    {caseItem.preContractedValue ? " (pre)" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {caseItem.totalApprovedHours.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {caseItem.totalActualHours.toFixed(1)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      caseItem.totalDifference < 0
                        ? "text-red-600"
                        : caseItem.totalDifference > 0
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {caseItem.totalDifference.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <DatePickerWithRange
          date={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          setDate={(newDateRange) => {
            if (newDateRange) {
              setDateRange({
                from: newDateRange.from || dateRange.from,
                to: newDateRange.to || dateRange.to,
              });
            }
          }}
        />
        <div className="flex-grow ml-4 border-t border-gray-300" />
      </div>

      <div className="ml-2 mr-2">
        {renderCaseTable(regularCases, "Regular Cases", false)}
        {renderCaseTable(preCases, "Pre-Contracted Cases", true)}
      </div>
    </div>
  );
}
