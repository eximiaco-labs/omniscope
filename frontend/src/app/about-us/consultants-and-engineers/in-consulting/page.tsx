"use client";

import { useQuery, gql } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { TableHeaderComponent } from "@/app/financial/revenue-forecast/components/TableHeader";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { TableCellComponent } from "@/app/financial/revenue-forecast/components/TableCell";
import SectionHeader from "@/components/SectionHeader";

const IN_CONSULTING_QUERY = gql`
  query InConsulting($dateOfInterest: Date) {
    inConsulting(dateOfInterest: $dateOfInterest) {
      dates {
        inAnalysis
        lastDayOfOneMonthAgo
        sameDayOneMonthAgo
        lastDayOfTwoMonthsAgo
        sameDayTwoMonthsAgo
        lastDayOfThreeMonthsAgo
        sameDayThreeMonthsAgo
      }
      workingDays {
        inAnalysis
        inAnalysisPartial
        oneMonthAgo
        sameDayOneMonthAgo
        twoMonthsAgo
        sameDayTwoMonthsAgo
        threeMonthsAgo
        sameDayThreeMonthsAgo
      }
      byWorker {
        name
        slug
        inAnalysis
        normalizedInAnalysis
        oneMonthAgo
        normalizedOneMonthAgo
        sameDayOneMonthAgo
        normalizedSameDayOneMonthAgo
        twoMonthsAgo
        normalizedTwoMonthsAgo
        sameDayTwoMonthsAgo
        normalizedSameDayTwoMonthsAgo
        threeMonthsAgo
        normalizedThreeMonthsAgo
        sameDayThreeMonthsAgo
        normalizedSameDayThreeMonthsAgo
        projected
        normalizedProjected
        expectedHistorical
        normalizedExpectedHistorical
      }
      totals {
        inAnalysis
        normalizedInAnalysis
        oneMonthAgo
        normalizedOneMonthAgo
        sameDayOneMonthAgo
        normalizedSameDayOneMonthAgo
        twoMonthsAgo
        normalizedTwoMonthsAgo
        sameDayTwoMonthsAgo
        normalizedSameDayTwoMonthsAgo
        threeMonthsAgo
        normalizedThreeMonthsAgo
        sameDayThreeMonthsAgo
        normalizedSameDayThreeMonthsAgo
        projected
        normalizedProjected
        expectedHistorical
        normalizedExpectedHistorical
      }
    }
  }
`;

const formatHours = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

export default function ConsultantsAllocationPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [sortConfigs, setSortConfigs] = useState<
    Record<string, { key: string; direction: "asc" | "desc" }>
  >({
    "in-consulting": {
      key: "inAnalysis",
      direction: "desc",
    },
  });

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(IN_CONSULTING_QUERY, {
    variables: {
      dateOfInterest: format(date, "yyyy-MM-dd"),
    },
  });

  const [normalized, setNormalized] = useState<Record<string, boolean>>({
    "in-consulting": false,
  });

  const [useHistorical, setUseHistorical] = useState<boolean>(false);

  const requestSort = (key: string) => {
    setSortConfigs((prev) => ({
      ...prev,
      "in-consulting": {
        key,
        direction:
          prev["in-consulting"].key === key &&
          prev["in-consulting"].direction === "desc"
            ? "asc"
            : "desc",
      },
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.inConsulting) return <div>No data available</div>;

  const sortedWorkers = [...data.inConsulting.byWorker].sort((a, b) => {
    const config = sortConfigs["in-consulting"];
    const key = config.key === 'realized' ? 'inAnalysis' : config.key;
    if (config.direction === "asc") {
      return a[key] - b[key];
    }
    return b[key] - a[key];
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <DatePicker date={date} onSelectedDateChange={setDate} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Normalized</span>
            <button
              onClick={() =>
                setNormalized((prev) => ({
                  ...prev,
                  "in-consulting": !prev["in-consulting"],
                }))
              }
              className={`
                w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
                ${normalized["in-consulting"] ? "bg-blue-600" : "bg-gray-200"}
                relative
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
                  ${normalized["in-consulting"] ? "transform translate-x-6" : ""}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeaderComponent
          dates={data.inConsulting.dates}
          workingDays={data.inConsulting.workingDays}
          tableId="in-consulting"
          normalized={normalized}
          requestSort={requestSort}
          hideHistoricalToggle={true}
          sortConfigs={sortConfigs}
        />
        <TableBody>
            {sortedWorkers.map((item, index) => (
                <TableRow className="h-[57px]">
                    <TableCell className="text-center text-gray-500 text-[10px]">
                        {index + 1}
                    </TableCell>
                    <TableCell className="border-r border-gray-400">
                        <Link 
                            href={`/about-us/consultants-and-engineers/${item.slug}`}
                            className={`text-blue-600 hover:text-blue-800`}
                        >
                            {item.name}
                        </Link>
                    </TableCell>
                    <TableCellComponent
                        value={item.sameDayThreeMonthsAgo}
                        normalizedValue={item.normalizedSameDayThreeMonthsAgo}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.sameDayThreeMonthsAgo}
                        normalizedTotalValue={data.inConsulting.totals.normalizedSameDayThreeMonthsAgo}
                        formatter={formatHours}
                        className="border-x border-gray-200 text-[12px]"
                    />
                    <TableCellComponent className="border-r border-gray-400 text-[12px]"
                        value={item.threeMonthsAgo} 
                        normalizedValue={item.normalizedThreeMonthsAgo}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.threeMonthsAgo}
                        normalizedTotalValue={data.inConsulting.totals.normalizedThreeMonthsAgo}
                        formatter={formatHours}
                    />
                    <TableCellComponent
                        value={item.sameDayTwoMonthsAgo}
                        normalizedValue={item.normalizedSameDayTwoMonthsAgo}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.sameDayTwoMonthsAgo}
                        normalizedTotalValue={data.inConsulting.totals.normalizedSameDayTwoMonthsAgo}
                        formatter={formatHours}
                        previousValue={item.sameDayThreeMonthsAgo}
                        normalizedPreviousValue={item.normalizedSameDayThreeMonthsAgo}
                        className="border-x border-gray-200 text-[12px]"
                    />
                    <TableCellComponent className="border-r border-gray-400 text-[12px]"
                        value={item.twoMonthsAgo}
                        normalizedValue={item.normalizedTwoMonthsAgo}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.twoMonthsAgo}
                        normalizedTotalValue={data.inConsulting.totals.normalizedTwoMonthsAgo}
                        formatter={formatHours}
                        previousValue={item.threeMonthsAgo}
                        normalizedPreviousValue={item.normalizedThreeMonthsAgo}
                    />
                    <TableCellComponent
                        value={item.sameDayOneMonthAgo}
                        normalizedValue={item.normalizedSameDayOneMonthAgo}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.sameDayOneMonthAgo}
                        normalizedTotalValue={data.inConsulting.totals.normalizedSameDayOneMonthAgo}
                        formatter={formatHours}
                        previousValue={item.sameDayTwoMonthsAgo}
                        normalizedPreviousValue={item.normalizedSameDayTwoMonthsAgo}
                        className="border-x border-gray-200 text-[12px]"
                    />
                    <TableCellComponent className="border-r border-gray-400 text-[12px]"
                        value={item.oneMonthAgo}
                        normalizedValue={item.normalizedOneMonthAgo}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.oneMonthAgo}
                        normalizedTotalValue={data.inConsulting.totals.normalizedOneMonthAgo}
                        formatter={formatHours}
                        previousValue={item.twoMonthsAgo}
                        normalizedPreviousValue={item.normalizedTwoMonthsAgo}
                    />
                    <TableCellComponent
                        value={item.inAnalysis}
                        normalizedValue={item.normalizedInAnalysis}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.inAnalysis}
                        normalizedTotalValue={data.inConsulting.totals.normalizedInAnalysis}
                        formatter={formatHours}
                        previousValue={item.sameDayOneMonthAgo}
                        normalizedPreviousValue={item.normalizedSameDayOneMonthAgo}
                        className="border-x border-gray-200"
                    />
                    <TableCellComponent
                        value={item.projected}
                        normalizedValue={item.normalizedProjected}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.projected}
                        normalizedTotalValue={data.inConsulting.totals.normalizedProjected}
                        formatter={formatHours}
                        className="border-x border-gray-200"
                        projected={item.projected}
                        normalizedProjected={item.normalizedProjected}
                        expected={item.expectedHistorical}
                        normalizedExpected={item.normalizedExpectedHistorical}
                    />
                    <TableCellComponent
                        value={item.expectedHistorical}
                        normalizedValue={item.normalizedExpectedHistorical}
                        normalized={normalized["in-consulting"]}
                        totalValue={data.inConsulting.totals.expectedHistorical}
                        normalizedTotalValue={data.inConsulting.totals.normalizedExpectedHistorical}
                        formatter={formatHours}
                        className="border-r border-gray-400"
                        projected={item.projected}
                        normalizedProjected={item.normalizedProjected}
                        expected={item.expectedHistorical}
                        normalizedExpected={item.normalizedExpectedHistorical}
                    />
                </TableRow>
            ))}
            <TableRow className="h-[57px] bg-gray-100 font-semibold">
                <TableCell className="text-center text-gray-500 text-[10px]">
                    
                </TableCell>
                <TableCell className="border-r border-gray-400">
                    Total
                </TableCell>
                <TableCellComponent
                    value={data.inConsulting.totals.sameDayThreeMonthsAgo}
                    normalizedValue={data.inConsulting.totals.normalizedSameDayThreeMonthsAgo}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.sameDayThreeMonthsAgo}
                    normalizedTotalValue={data.inConsulting.totals.normalizedSameDayThreeMonthsAgo}
                    formatter={formatHours}
                    className="border-x border-gray-200 text-[12px]"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.threeMonthsAgo}
                    normalizedValue={data.inConsulting.totals.normalizedThreeMonthsAgo}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.threeMonthsAgo}
                    normalizedTotalValue={data.inConsulting.totals.normalizedThreeMonthsAgo}
                    formatter={formatHours}
                    className="border-r border-gray-400 text-[12px]"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.sameDayTwoMonthsAgo}
                    normalizedValue={data.inConsulting.totals.normalizedSameDayTwoMonthsAgo}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.sameDayTwoMonthsAgo}
                    normalizedTotalValue={data.inConsulting.totals.normalizedSameDayTwoMonthsAgo}
                    formatter={formatHours}
                    className="border-x border-gray-200 text-[12px]"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.twoMonthsAgo}
                    normalizedValue={data.inConsulting.totals.normalizedTwoMonthsAgo}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.twoMonthsAgo}
                    normalizedTotalValue={data.inConsulting.totals.normalizedTwoMonthsAgo}
                    formatter={formatHours}
                    className="border-r border-gray-400 text-[12px]"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.sameDayOneMonthAgo}
                    normalizedValue={data.inConsulting.totals.normalizedSameDayOneMonthAgo}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.sameDayOneMonthAgo}
                    normalizedTotalValue={data.inConsulting.totals.normalizedSameDayOneMonthAgo}
                    formatter={formatHours}
                    className="border-x border-gray-200 text-[12px]"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.oneMonthAgo}
                    normalizedValue={data.inConsulting.totals.normalizedOneMonthAgo}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.oneMonthAgo}
                    normalizedTotalValue={data.inConsulting.totals.normalizedOneMonthAgo}
                    formatter={formatHours}
                    className="border-r border-gray-400 text-[12px]"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.inAnalysis}
                    normalizedValue={data.inConsulting.totals.normalizedInAnalysis}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.inAnalysis}
                    normalizedTotalValue={data.inConsulting.totals.normalizedInAnalysis}
                    formatter={formatHours}
                    className="border-x border-gray-200"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.projected}
                    normalizedValue={data.inConsulting.totals.normalizedProjected}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.projected}
                    normalizedTotalValue={data.inConsulting.totals.normalizedProjected}
                    formatter={formatHours}
                    className="border-x border-gray-200"
                />
                <TableCellComponent
                    value={data.inConsulting.totals.expectedHistorical}
                    normalizedValue={data.inConsulting.totals.normalizedExpectedHistorical}
                    normalized={normalized["in-consulting"]}
                    totalValue={data.inConsulting.totals.expectedHistorical}
                    normalizedTotalValue={data.inConsulting.totals.normalizedExpectedHistorical}
                    formatter={formatHours}
                    className="border-r border-gray-400"
                />
            </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
