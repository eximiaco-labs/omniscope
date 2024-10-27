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
} from "@/components/catalyst/table";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { LittleStat, Stat } from "@/app/components/analytics/stat";
import Link from "next/link";

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="space-y-6">
      <Heading>Approved vs Actual Hours (Consulting)</Heading>

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

      <div className="mt-4 grid grid-cols-4 gap-4">
        <Stat
          title="Number of Cases"
          value={data?.approvedVsActual?.numberOfCases.toString() ?? "N/A"}
        />
        <Stat
          title="Approved Hours"
          value={data?.approvedVsActual?.totalApprovedHours.toString() ?? "N/A"}
        />
        <Stat
          title="Actual Hours"
          value={data?.approvedVsActual?.totalActualHours.toString() ?? "N/A"}
        />
        <Stat
          title="Difference"
          value={data?.approvedVsActual?.totalDifference.toFixed(2) ?? "N/A"}
          color={
            data?.approvedVsActual?.totalDifference < 0
              ? "darkred"
              : data?.approvedVsActual?.totalDifference > 0
              ? "darkblue"
              : "darkgreen"
          }
        />
      </div>
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {data?.approvedVsActual?.cases.map((caseItem: any, index: number) => (
                <React.Fragment key={index}>
                  <tr className="mb-2">
                    <td className="whitespace-normal break-words w-auto">
                      <Link href={`/about-us/cases/${caseItem.id}`}>
                        <div className="font-bold text-gray-700">{caseItem.title}</div>
                        <div className="text-sm text-gray-600">
                          {caseItem.startOfContract && (
                            <span className="text-green-600">
                              {new Date(caseItem.startOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {caseItem.startOfContract && caseItem.endOfContract && ' - '}
                          {caseItem.endOfContract && (
                            <span className="text-red-600">
                              {new Date(caseItem.endOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {caseItem.weeklyApprovedHours && (
                            <span className={`${(caseItem.startOfContract || caseItem.endOfContract) ? 'ml-2' : ''}`}>
                              {(caseItem.startOfContract || caseItem.endOfContract) ? '• ' : ''}Hours per week: {caseItem.weeklyApprovedHours}{caseItem.preContractedValue ? ' (pre)' : ''}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="mt-4 mb-4">
                        <table className="text-sm">
                          <thead>
                            <tr className="bg-white border-b border-gray-200">
                              <th className="px-2 py-1 text-left w-48">Week</th>
                              <th className="px-2 py-1 text-right w-24">Actual</th>
                              <th className="px-2 py-1 text-right w-24">Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseItem.weeks.map((week: any, weekIndex: number) => (
                              <tr key={weekIndex} className={weekIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-2 py-1 w-48">{week.title}</td>
                                <td className="px-2 py-1 text-right w-24">{week.actualHours.toFixed(1)}</td>
                                <td className={`px-2 py-1 text-right w-24 ${
                                  week.difference < 0 ? 'text-red-600' : 
                                  week.difference > 0 ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {week.difference.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                    <td className="w-24">
                      <LittleStat
                        title="Approved"
                        value={caseItem.totalApprovedHours.toString()}
                      />
                    </td>
                    <td className="w-24">
                      <LittleStat
                        title="Actual"
                        value={caseItem.totalActualHours.toString()}
                      />
                    </td>
                    <td className="w-24">
                      <LittleStat
                        title="Difference"
                        value={caseItem.totalDifference.toFixed(2)}
                        color={
                          caseItem.totalDifference < 0
                            ? "darkred"
                            : caseItem.totalDifference > 0
                            ? "darkblue"
                            : "darkgreen"
                        }
                      />
                    </td>
                  </tr>
                  {index < data.approvedVsActual.cases.length - 1 && (
                    <tr>
                      <td colSpan={4}>
                        <hr className="border-gray-200" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
