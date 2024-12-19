"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { DatePicker } from "@/components/DatePicker";
import { REVENUE_FORECAST_QUERY } from "./query";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { NavBar } from "@/app/components/NavBar";
import { FilterFieldsSelect } from "../../components/FilterFieldsSelect";
import { RevenueProgression } from "./RevenueProgression";
import { Toggle } from "@/components/ui/toggle";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const sections = [
  {
    id: "consulting",
    title: "Consulting",
  },
  {
    id: "consultingPre",
    title: "Consulting Pre",
  },
  {
    id: "handsOn",
    title: "Hands On",
  },
  {
    id: "squad",
    title: "Squad",
  },
];

export default function RevenueForecastPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);
  const [sortConfigs, setSortConfigs] = useState<
    Record<
      string,
      {
        key: string;
        direction: "asc" | "desc";
      }
    >
  >({
    consulting: { key: "current", direction: "desc" },
    consultingPre: { key: "current", direction: "desc" },
    handsOn: { key: "current", direction: "desc" },
    squad: { key: "current", direction: "desc" },
  });
  const [expandedClients, setExpandedClients] = useState<Record<string, string[]>>({
    consultingPre: [],
    handsOn: [],
    squad: []
  });
  const [useHistorical, setUseHistorical] = useState<Record<string, boolean>>({
    consulting: false,
    consultingPre: false,
    handsOn: false,
    squad: false
  });
  const [normalized, setNormalized] = useState<Record<string, boolean>>({
    consulting: false,
    consultingPre: false,
    handsOn: false,
    squad: false
  });

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.forecast?.filterableFields?.reduce((acc: any[], field: any) => {
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

  const { loading, error, data } = useQuery(REVENUE_FORECAST_QUERY, {
    variables: {
      dateOfInterest: format(date, "yyyy-MM-dd"),
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.forecast?.dates) return <div>No data available</div>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0 || value === 0) return "";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const requestSort = (key: string, tableId: string) => {
    setSortConfigs((prevConfigs) => {
      const newConfigs = { ...prevConfigs };
      let direction: "asc" | "desc" = "desc";
      if (
        newConfigs[tableId].key === key &&
        newConfigs[tableId].direction === "desc"
      ) {
        direction = "asc";
      }
      newConfigs[tableId] = { key, direction };
      return newConfigs;
    });
  };

  const getSortedClients = (clients: any[], tableId: string) => {
    const sortConfig = sortConfigs[tableId];
    if (!sortConfig?.key) return clients;

    return [...clients].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const toggleClient = (clientSlug: string, tableId: string) => {
    setExpandedClients(prev => {
      const tableClients = prev[tableId] || [];
      const newTableClients = tableClients.includes(clientSlug)
        ? tableClients.filter(slug => slug !== clientSlug)
        : [...tableClients, clientSlug];
      
      return {
        ...prev,
        [tableId]: newTableClients
      };
    });
  };

  const renderConsultingTable = (
    title: string,
    tableData: any,
    tableId: string
  ) => {
    const sortedClients = getSortedClients(tableData.clients, tableId);
    const sortConfig = sortConfigs[tableId];
    const total = tableData.totals;
    const dates = data.forecast.dates;
    const workingDays = data.forecast.workingDays;

    const calculatePercentageChange = (currentValue: number, previousValue: number | null, workingDays: number) => {
      // If normalized, use normalized values directly
      const currentComparisonValue = normalized[tableId] ? currentValue : currentValue;
      const previousComparisonValue = previousValue ? (normalized[tableId] ? previousValue : previousValue) : null;
      
      if (!previousComparisonValue || previousComparisonValue === 0) return null;
      
      const percentageChange = ((currentComparisonValue - previousComparisonValue) / previousComparisonValue) * 100;
      return {
        percentageChange,
        indicator: percentageChange > 0 ? "↑" : percentageChange < 0 ? "↓" : "",
        indicatorColor: percentageChange > 0 ? "text-green-600" : "text-red-600"
      };
    };

    const renderCell = (value: number, normalizedValue: number, totalValue: number, normalizedTotalValue: number, className: string = "", projected?: number, normalizedProjected?: number, expected?: number, normalizedExpected?: number, previousValue: number | null = null, normalizedPreviousValue: number | null = null) => {
      const isProjectedLessThanExpected = projected !== undefined && expected !== undefined && projected < expected;
      const bgColor = isProjectedLessThanExpected ? "bg-red-100" : "";
      
      const displayValue = normalized[tableId] ? normalizedValue : value;
      const displayTotalValue = normalized[tableId] ? normalizedTotalValue : totalValue;

      let changeInfo = null;
      if (previousValue !== null) {
        changeInfo = calculatePercentageChange(
          normalized[tableId] ? normalizedValue : value,
          normalized[tableId] ? normalizedPreviousValue : previousValue,
          1 // No need for working days since we're using normalized values
        );
      }

      return (
        <TableCell
          className={`text-right ${className} ${
            value === 0 ? "text-gray-300" : ""
          } relative ${bgColor}`}
        >
          {formatCurrency(displayValue)}
          <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1 box-border">
            <span className={changeInfo ? `${changeInfo.indicatorColor}` : ''}>
              {changeInfo && (
                <>{changeInfo.indicator} {Math.abs(changeInfo.percentageChange).toFixed(1)}%</>
              )}
            </span>
            <span className="text-gray-400 truncate mr-2">
              {formatPercentage(value, totalValue)}
            </span>
          </div>
        </TableCell>
      );
    };

    const renderSortHeader = (key: string, normalizedKey: string, label: string, workingDays: number | null = null, className: string = "") => (
      <TableHead
        onClick={() => requestSort(normalized[tableId] ? normalizedKey : key, tableId)}
        className={`text-right cursor-pointer hover:bg-gray-100 ${className}`}
      >
        {label}
        {workingDays !== null && <span className="block text-[10px] text-gray-500">{workingDays} working days</span>}
        {sortConfig.key === (normalized[tableId] ? normalizedKey : key) && (sortConfig.direction === "asc" ? "↑" : "↓")}
      </TableHead>
    );

    const renderMonthHeader = (date: string, days: number, colSpan: number = 2, className: string = "") => (
      <TableHead colSpan={colSpan} className={`text-center ${className}`}>
        {format(new Date(date), "MMM yyyy")}
        <span className="block text-[10px] text-gray-500">{days} working days</span>
      </TableHead>
    );

    const renderRow = (item: any, depth: number = 0) => {
      const baseClasses = depth === 1 ? "bg-gray-50" : depth === 2 ? "bg-gray-100" : depth === 3 ? "bg-gray-150" : "";
      const paddingLeft = depth * 4;
      const expectedValue = useHistorical[tableId] ? item.expectedHistorical : item.expected;
      const normalizedExpectedValue = useHistorical[tableId] ? item.normalizedExpectedHistorical : item.normalizedExpected;
      
      return (
        <TableRow key={item.name || item.title} className={`h-[57px] ${baseClasses} ${depth === 0 ? 'border-b-[1px]' : ''}`}>
          <TableCell className="text-center text-gray-500 text-[10px]">
            {depth === 0 && sortedClients.indexOf(item) + 1}
          </TableCell>
          <TableCell className="border-r border-gray-400">
            <div className="flex items-center gap-2" style={{paddingLeft: `${paddingLeft}px`}}>
              {(depth < 3) && (
                <button 
                  onClick={() => toggleClient(item.slug, tableId)}
                  className="w-4 h-4 flex items-center justify-center text-gray-500"
                >
                  {expandedClients[tableId]?.includes(item.slug) ? '−' : '+'}
                </button>
              )}
              {depth < 3 ? (
                <Link 
                  href={`/about-us/${depth === 0 ? 'clients' : depth === 1 ? 'sponsors' : 'cases'}/${item.slug}`} 
                  className={`text-blue-600 hover:text-blue-800 ${depth > 0 ? 'text-[12px]' : ''}`}
                >
                  {item.name || item.title}
                </Link>
              ) : (
                <span className="text-[12px]">{item.name}</span>
              )}
            </div>
          </TableCell>
          {renderCell(
            item.sameDayThreeMonthsAgo, 
            item.normalizedSameDayThreeMonthsAgo,
            total.sameDayThreeMonthsAgo,
            total.normalizedSameDayThreeMonthsAgo,
            "border-x border-gray-200 text-[12px]"
          )}
          {renderCell(
            item.threeMonthsAgo,
            item.normalizedThreeMonthsAgo,
            total.threeMonthsAgo,
            total.normalizedThreeMonthsAgo,
            "border-r border-gray-400 text-[12px]"
          )}
          {renderCell(
            item.sameDayTwoMonthsAgo,
            item.normalizedSameDayTwoMonthsAgo,
            total.sameDayTwoMonthsAgo,
            total.normalizedSameDayTwoMonthsAgo,
            "border-x border-gray-200 text-[12px]",
            undefined,
            undefined,
            undefined,
            undefined,
            item.sameDayThreeMonthsAgo,
            item.normalizedSameDayThreeMonthsAgo
          )}
          {renderCell(
            item.twoMonthsAgo,
            item.normalizedTwoMonthsAgo,
            total.twoMonthsAgo,
            total.normalizedTwoMonthsAgo,
            "border-r border-gray-400 text-[12px]",
            undefined,
            undefined,
            undefined,
            undefined,
            item.threeMonthsAgo,
            item.normalizedThreeMonthsAgo
          )}
          {renderCell(
            item.sameDayOneMonthAgo,
            item.normalizedSameDayOneMonthAgo,
            total.sameDayOneMonthAgo,
            total.normalizedSameDayOneMonthAgo,
            "border-x border-gray-200 text-[12px]",
            undefined,
            undefined,
            undefined,
            undefined,
            item.sameDayTwoMonthsAgo,
            item.normalizedSameDayTwoMonthsAgo
          )}
          {renderCell(
            item.oneMonthAgo,
            item.normalizedOneMonthAgo,
            total.oneMonthAgo,
            total.normalizedOneMonthAgo,
            "border-r border-gray-400 text-[12px]",
            undefined,
            undefined,
            undefined,
            undefined,
            item.twoMonthsAgo,
            item.normalizedTwoMonthsAgo
          )}
          {renderCell(
            item.realized,
            item.normalizedRealized,
            total.realized,
            total.normalizedRealized,
            "border-x border-gray-200",
            undefined,
            undefined,
            undefined,
            undefined,
            item.sameDayOneMonthAgo,
            item.normalizedSameDayOneMonthAgo
          )}
          {renderCell(
            item.projected,
            item.normalizedProjected,
            total.projected,
            total.normalizedProjected,
            "border-x border-gray-200",
            item.projected,
            item.normalizedProjected,
            expectedValue,
            normalizedExpectedValue,
            item.oneMonthAgo,
            item.normalizedOneMonthAgo
          )}
          {renderCell(
            expectedValue,
            normalizedExpectedValue,
            useHistorical[tableId] ? total.expectedHistorical : total.expected,
            useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
            "border-r border-gray-400",
            item.projected,
            item.normalizedProjected,
            expectedValue,
            normalizedExpectedValue,
            item.oneMonthAgo,
            item.normalizedOneMonthAgo
          )}
        </TableRow>
      );
    };

    return (
      <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
        <div className="flex justify-between items-center">
          <SectionHeader
            title={title}
            subtitle={`${formatCurrency(total.realized)} / ${formatCurrency(useHistorical[tableId] ? total.expectedHistorical : total.expected)}`}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Normalized</span>
            <button
              onClick={() => setNormalized(prev => ({
                ...prev,
                [tableId]: !prev[tableId]
              }))}
              className={`
                w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
                ${normalized[tableId] ? 'bg-blue-600' : 'bg-gray-200'}
                relative
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
                  ${normalized[tableId] ? 'transform translate-x-6' : ''}
                `}
              />
            </button>
          </div>
        </div>
        <div className="px-2">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead rowSpan={2} className="w-[50px] text-center">#</TableHead>
                <TableHead rowSpan={2} className="border-r border-gray-400">Client</TableHead>
                {renderMonthHeader(dates.threeMonthsAgo, workingDays.threeMonthsAgo, 2, "border-x border-gray-400")}
                {renderMonthHeader(dates.twoMonthsAgo, workingDays.twoMonthsAgo, 2, "border-x border-gray-400")}
                {renderMonthHeader(dates.oneMonthAgo, workingDays.oneMonthAgo, 2, "border-x border-gray-400")}
                {renderMonthHeader(data.forecast.dateOfInterest, workingDays.inAnalysis, 3, "border-x border-gray-400")}
              </TableRow>
              <TableRow>
                {renderSortHeader("sameDayThreeMonthsAgo", "normalizedSameDayThreeMonthsAgo", `Until ${format(new Date(dates.sameDayThreeMonthsAgo), "dd")}`, workingDays.sameDayThreeMonthsAgo, "w-[95px] border-x border-gray-200")}
                {renderSortHeader("threeMonthsAgo", "normalizedThreeMonthsAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
                {renderSortHeader("sameDayTwoMonthsAgo", "normalizedSameDayTwoMonthsAgo", `Until ${format(new Date(dates.sameDayTwoMonthsAgo), "dd")}`, workingDays.sameDayTwoMonthsAgo, "w-[95px] border-x border-gray-200")}
                {renderSortHeader("twoMonthsAgo", "normalizedTwoMonthsAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
                {renderSortHeader("sameDayOneMonthAgo", "normalizedSameDayOneMonthAgo", `Until ${format(new Date(dates.sameDayOneMonthAgo), "dd")}`, workingDays.sameDayOneMonthAgo, "w-[95px] border-x border-gray-200")}
                {renderSortHeader("oneMonthAgo", "normalizedOneMonthAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
                {renderSortHeader("realized", "normalizedRealized", "Realized", workingDays.inAnalysisPartial, "w-[120px] border-x border-gray-200")}
                {renderSortHeader("projected", "normalizedProjected", "Projected", null, "w-[120px] border-x border-gray-200")}
                <TableHead className="w-[120px] border-r border-gray-400">
                  <div className="flex flex-col items-end">
                    <span 
                      onClick={() => requestSort(
                        normalized[tableId] 
                          ? (useHistorical[tableId] ? "normalizedExpectedHistorical" : "normalizedExpected")
                          : (useHistorical[tableId] ? "expectedHistorical" : "expected"),
                        tableId
                      )} 
                      className="cursor-pointer hover:text-gray-600"
                    >
                      Expected {sortConfig.key === (useHistorical[tableId] ? "expectedHistorical" : "expected") && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                    <button
                      onClick={() => {
                        setUseHistorical(prev => ({
                          ...prev,
                          [tableId]: !prev[tableId]
                        }));
                      }}
                      className={`
                        text-[10px] mt-0.5 
                        ${useHistorical[tableId] 
                          ? 'text-blue-600' 
                          : 'text-gray-400 hover:text-gray-600'
                        }
                        transition-colors cursor-pointer
                      `}
                    >
                      historical
                    </button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client: any) => (
                <>
                  {renderRow(client)}
                  {expandedClients[tableId]?.includes(client.slug) && 
                    tableData.sponsors
                      .filter((sponsor: any) => sponsor.clientSlug === client.slug)
                      .map((sponsor: any) => (
                        <>
                          {renderRow(sponsor, 1)}
                          {expandedClients[tableId]?.includes(sponsor.slug) && 
                            tableData.cases
                              .filter((caseItem: any) => caseItem.sponsorSlug === sponsor.slug)
                              .map((caseItem: any) => (
                                <>
                                  {renderRow(caseItem, 2)}
                                  {expandedClients[tableId]?.includes(caseItem.slug) &&
                                    tableData.projects
                                      .filter((project: any) => project.caseSlug === caseItem.slug)
                                      .map((project: any) => renderRow(project, 3))
                                  }
                                </>
                              ))
                          }
                        </>
                      ))
                  }
                </>
              ))}
              <TableRow className="font-bold border-t-4 h-[57px]">
                <TableCell></TableCell>
                <TableCell className="border-r border-gray-400">Total</TableCell>
                {renderCell(
                  total.sameDayThreeMonthsAgo,
                  total.normalizedSameDayThreeMonthsAgo,
                  total.sameDayThreeMonthsAgo,
                  total.normalizedSameDayThreeMonthsAgo,
                  "border-x border-gray-200 text-[12px]"
                )}
                {renderCell(
                  total.threeMonthsAgo,
                  total.normalizedThreeMonthsAgo,
                  total.threeMonthsAgo,
                  total.normalizedThreeMonthsAgo,
                  "border-r border-gray-400 text-[12px]"
                )}
                {renderCell(
                  total.sameDayTwoMonthsAgo,
                  total.normalizedSameDayTwoMonthsAgo,
                  total.sameDayTwoMonthsAgo,
                  total.normalizedSameDayTwoMonthsAgo,
                  "border-x border-gray-200 text-[12px]",
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  total.sameDayThreeMonthsAgo,
                  total.normalizedSameDayThreeMonthsAgo
                )}
                {renderCell(
                  total.twoMonthsAgo,
                  total.normalizedTwoMonthsAgo,
                  total.twoMonthsAgo,
                  total.normalizedTwoMonthsAgo,
                  "border-r border-gray-400 text-[12px]",
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  total.threeMonthsAgo,
                  total.normalizedThreeMonthsAgo
                )}
                {renderCell(
                  total.sameDayOneMonthAgo,
                  total.normalizedSameDayOneMonthAgo,
                  total.sameDayOneMonthAgo,
                  total.normalizedSameDayOneMonthAgo,
                  "border-x border-gray-200 text-[12px]",
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  total.sameDayTwoMonthsAgo,
                  total.normalizedSameDayTwoMonthsAgo
                )}
                {renderCell(
                  total.oneMonthAgo,
                  total.normalizedOneMonthAgo,
                  total.oneMonthAgo,
                  total.normalizedOneMonthAgo,
                  "border-r border-gray-400 text-[12px]",
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  total.twoMonthsAgo,
                  total.normalizedTwoMonthsAgo
                )}
                {renderCell(
                  total.realized,
                  total.normalizedRealized,
                  total.realized,
                  total.normalizedRealized,
                  "border-x border-gray-200",
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  total.sameDayOneMonthAgo,
                  total.normalizedSameDayOneMonthAgo
                )}
                {renderCell(
                  total.projected,
                  total.normalizedProjected,
                  total.projected,
                  total.normalizedProjected,
                  "border-x border-gray-200",
                  total.projected,
                  total.normalizedProjected,
                  useHistorical[tableId] ? total.expectedHistorical : total.expected,
                  useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                  total.oneMonthAgo,
                  total.normalizedOneMonthAgo
                )}
                {renderCell(
                  useHistorical[tableId] ? total.expectedHistorical : total.expected,
                  useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                  useHistorical[tableId] ? total.expectedHistorical : total.expected,
                  useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                  "border-r border-gray-400",
                  total.projected,
                  total.normalizedProjected,
                  useHistorical[tableId] ? total.expectedHistorical : total.expected,
                  useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                  total.oneMonthAgo,
                  total.normalizedOneMonthAgo
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderOtherTable = (title: string, tableData: any, tableId: string) => {
    const sortedClients = getSortedClients(tableData.clients, tableId);
    const sortConfig = sortConfigs[tableId];
    const total = tableData.totals;
    const dates = data.forecast.dates;

    return (
      <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
        <SectionHeader title={title} subtitle={formatCurrency(total.current)} />
        <div className="px-2">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead
                  onClick={() => requestSort("threeMonthsAgo", tableId)}
                  className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
                >
                  {format(new Date(dates.threeMonthsAgo), "MMM yyyy")}{" "}
                  {sortConfig.key === "threeMonthsAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("twoMonthsAgo", tableId)}
                  className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
                >
                  {format(new Date(dates.twoMonthsAgo), "MMM yyyy")}{" "}
                  {sortConfig.key === "twoMonthsAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("oneMonthAgo", tableId)}
                  className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
                >
                  {format(new Date(dates.oneMonthAgo), "MMM yyyy")}{" "}
                  {sortConfig.key === "oneMonthAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("current", tableId)}
                  className="text-center border-x w-[120px] cursor-pointer hover:bg-gray-100"
                >
                  {format(new Date(data.forecast.dateOfInterest), "MMM yyyy")}{" "}
                  {sortConfig.key === "current" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client: any, index: number) => (
                <>
                  <TableRow key={client.name} className="h-[57px]">
                    <TableCell className="text-center text-gray-500 text-[10px]">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <button 
                          onClick={() => toggleClient(client.slug, tableId)}
                          className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                        >
                          {expandedClients[tableId]?.includes(client.slug) ? '−' : '+'}
                        </button>
                        <Link href={`/about-us/clients/${client.slug}`} className="text-blue-600 hover:text-blue-800">
                          {client.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right border-x text-[12px] ${
                        client.threeMonthsAgo === 0 ? "text-gray-300" : ""
                      } relative`}
                    >
                      {formatCurrency(client.threeMonthsAgo)}
                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                        {formatPercentage(
                          client.threeMonthsAgo,
                          total.threeMonthsAgo
                        )}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right border-x text-[12px] ${
                        client.twoMonthsAgo === 0 ? "text-gray-300" : ""
                      } relative`}
                    >
                      {formatCurrency(client.twoMonthsAgo)}
                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                        {formatPercentage(
                          client.twoMonthsAgo,
                          total.twoMonthsAgo
                        )}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right border-x text-[12px] ${
                        client.oneMonthAgo === 0 ? "text-gray-300" : ""
                      } relative`}
                    >
                      {formatCurrency(client.oneMonthAgo)}
                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                        {formatPercentage(client.oneMonthAgo, total.oneMonthAgo)}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right border-x ${
                        client.current === 0 ? "text-gray-300" : ""
                      } relative`}
                    >
                      {formatCurrency(client.current)}
                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                        {formatPercentage(client.current, total.current)}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedClients[tableId]?.includes(client.slug) && 
                    tableData.sponsors
                      .filter((sponsor: any) => sponsor.clientSlug === client.slug)
                      .map((sponsor: any) => (
                        <>
                          <TableRow key={sponsor.name} className="h-[57px] bg-gray-50">
                            <TableCell></TableCell>
                            <TableCell className="pl-4">
                              <div className="flex items-center">
                                <button 
                                  onClick={() => toggleClient(sponsor.slug, tableId)}
                                  className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                                >
                                  {expandedClients[tableId]?.includes(sponsor.slug) ? '−' : '+'}
                                </button>
                                <Link href={`/about-us/sponsors/${sponsor.slug}`} className="text-blue-600 hover:text-blue-800 text-[14px]">
                                  {sponsor.name}
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell
                              className={`text-right border-x text-[12px] ${
                                sponsor.threeMonthsAgo === 0 ? "text-gray-300" : ""
                              } relative`}
                            >
                              {formatCurrency(sponsor.threeMonthsAgo)}
                              <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                {formatPercentage(
                                  sponsor.threeMonthsAgo,
                                  total.threeMonthsAgo
                                )}
                              </span>
                            </TableCell>
                            <TableCell
                              className={`text-right border-x text-[12px] ${
                                sponsor.twoMonthsAgo === 0 ? "text-gray-300" : ""
                              } relative`}
                            >
                              {formatCurrency(sponsor.twoMonthsAgo)}
                              <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                {formatPercentage(
                                  sponsor.twoMonthsAgo,
                                  total.twoMonthsAgo
                                )}
                              </span>
                            </TableCell>
                            <TableCell
                              className={`text-right border-x text-[12px] ${
                                sponsor.oneMonthAgo === 0 ? "text-gray-300" : ""
                              } relative`}
                            >
                              {formatCurrency(sponsor.oneMonthAgo)}
                              <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                {formatPercentage(
                                  sponsor.oneMonthAgo,
                                  total.oneMonthAgo
                                )}
                              </span>
                            </TableCell>
                            <TableCell
                              className={`text-right border-x ${
                                sponsor.current === 0 ? "text-gray-300" : ""
                              } relative`}
                            >
                              {formatCurrency(sponsor.current)}
                              <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                {formatPercentage(sponsor.current, total.current)}
                              </span>
                            </TableCell>
                          </TableRow>
                          {expandedClients[tableId]?.includes(sponsor.slug) &&
                            tableData.cases
                              .filter((caseItem: any) => caseItem.sponsorSlug === sponsor.slug)
                              .map((caseItem: any) => (
                                <>
                                  <TableRow key={caseItem.title} className="h-[57px] bg-gray-100">
                                    <TableCell></TableCell>
                                    <TableCell className="pl-9">
                                      <div className="flex items-center">
                                        <button 
                                          onClick={() => toggleClient(caseItem.slug, tableId)}
                                          className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                                        >
                                          {expandedClients[tableId]?.includes(caseItem.slug) ? '−' : '+'}
                                        </button>
                                        <Link href={`/about-us/cases/${caseItem.slug}`} className="text-blue-600 hover:text-blue-800 text-[12px]">
                                          {caseItem.title}
                                        </Link>
                                      </div>
                                    </TableCell>
                                    <TableCell
                                      className={`text-right border-x text-[12px] ${
                                        caseItem.threeMonthsAgo === 0 ? "text-gray-300" : ""
                                      } relative`}
                                    >
                                      {formatCurrency(caseItem.threeMonthsAgo)}
                                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                        {formatPercentage(
                                          caseItem.threeMonthsAgo,
                                          total.threeMonthsAgo
                                        )}
                                      </span>
                                    </TableCell>
                                    <TableCell
                                      className={`text-right border-x text-[12px] ${
                                        caseItem.twoMonthsAgo === 0 ? "text-gray-300" : ""
                                      } relative`}
                                    >
                                      {formatCurrency(caseItem.twoMonthsAgo)}
                                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                        {formatPercentage(
                                          caseItem.twoMonthsAgo,
                                          total.twoMonthsAgo
                                        )}
                                      </span>
                                    </TableCell>
                                    <TableCell
                                      className={`text-right border-x text-[12px] ${
                                        caseItem.oneMonthAgo === 0 ? "text-gray-300" : ""
                                      } relative`}
                                    >
                                      {formatCurrency(caseItem.oneMonthAgo)}
                                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                        {formatPercentage(
                                          caseItem.oneMonthAgo,
                                          total.oneMonthAgo
                                        )}
                                      </span>
                                    </TableCell>
                                    <TableCell
                                      className={`text-right border-x ${
                                        caseItem.current === 0 ? "text-gray-300" : ""
                                      } relative`}
                                    >
                                      {formatCurrency(caseItem.current)}
                                      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                        {formatPercentage(caseItem.current, total.current)}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                  {expandedClients[tableId]?.includes(caseItem.slug) &&
                                    tableData.projects
                                      .filter((project: any) => project.caseSlug === caseItem.slug)
                                      .map((project: any) => (
                                        <TableRow key={project.name} className="h-[57px] bg-gray-200">
                                          <TableCell></TableCell>
                                          <TableCell className="pl-14 text-[12px]">
                                            {project.name}
                                          </TableCell>
                                          <TableCell
                                            className={`text-right border-x text-[12px] ${
                                              project.threeMonthsAgo === 0 ? "text-gray-300" : ""
                                            } relative`}
                                          >
                                            {formatCurrency(project.threeMonthsAgo)}
                                            <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                              {formatPercentage(
                                                project.threeMonthsAgo,
                                                total.threeMonthsAgo
                                              )}
                                            </span>
                                          </TableCell>
                                          <TableCell
                                            className={`text-right border-x text-[12px] ${
                                              project.twoMonthsAgo === 0 ? "text-gray-300" : ""
                                            } relative`}
                                          >
                                            {formatCurrency(project.twoMonthsAgo)}
                                            <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                              {formatPercentage(
                                                project.twoMonthsAgo,
                                                total.twoMonthsAgo
                                              )}
                                            </span>
                                          </TableCell>
                                          <TableCell
                                            className={`text-right border-x text-[12px] ${
                                              project.oneMonthAgo === 0 ? "text-gray-300" : ""
                                            } relative`}
                                          >
                                            {formatCurrency(project.oneMonthAgo)}
                                            <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                              {formatPercentage(
                                                project.oneMonthAgo,
                                                total.oneMonthAgo
                                              )}
                                            </span>
                                          </TableCell>
                                          <TableCell
                                            className={`text-right border-x ${
                                              project.current === 0 ? "text-gray-300" : ""
                                            } relative`}
                                          >
                                            {formatCurrency(project.current)}
                                            <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                                              {formatPercentage(project.current, total.current)}
                                            </span>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                  }
                                </>
                              ))
                          }
                        </>
                      ))
                  }
                </>
              ))}
              <TableRow className="font-bold border-t-2 h-[57px]">
                <TableCell></TableCell>
                <TableCell>Total</TableCell>
                <TableCell className="text-right border-x text-[12px]">
                  {formatCurrency(total.threeMonthsAgo)}
                </TableCell>
                <TableCell className="text-right border-x text-[12px]">
                  {formatCurrency(total.twoMonthsAgo)}
                </TableCell>
                <TableCell className="text-right border-x text-[12px]">
                  {formatCurrency(total.oneMonthAgo)}
                </TableCell>
                <TableCell className="text-right border-x">
                  {formatCurrency(total.current)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const forecastData = {
    consulting: {
      clients: data.forecast.byKind.consulting.byClient.map((client: any) => ({
        name: client.name,
        slug: client.slug,
        sameDayThreeMonthsAgo: client.sameDayThreeMonthsAgo,
        normalizedSameDayThreeMonthsAgo: client.sameDayThreeMonthsAgo / data.forecast.workingDays.sameDayThreeMonthsAgo,
        threeMonthsAgo: client.threeMonthsAgo,
        normalizedThreeMonthsAgo: client.threeMonthsAgo / data.forecast.workingDays.threeMonthsAgo,
        sameDayTwoMonthsAgo: client.sameDayTwoMonthsAgo,
        normalizedSameDayTwoMonthsAgo: client.sameDayTwoMonthsAgo / data.forecast.workingDays.sameDayTwoMonthsAgo,
        twoMonthsAgo: client.twoMonthsAgo,
        normalizedTwoMonthsAgo: client.twoMonthsAgo / data.forecast.workingDays.twoMonthsAgo,
        sameDayOneMonthAgo: client.sameDayOneMonthAgo,
        normalizedSameDayOneMonthAgo: client.sameDayOneMonthAgo / data.forecast.workingDays.sameDayOneMonthAgo,
        oneMonthAgo: client.oneMonthAgo,
        normalizedOneMonthAgo: client.oneMonthAgo / data.forecast.workingDays.oneMonthAgo,
        realized: client.inAnalysis,
        normalizedRealized: client.inAnalysis / data.forecast.workingDays.inAnalysisPartial,
        projected: client.projected,
        normalizedProjected: client.projected / data.forecast.workingDays.inAnalysis,
        expected: client.expected,
        normalizedExpected: client.expected / data.forecast.workingDays.inAnalysis,
        expectedHistorical: client.expectedHistorical,
        normalizedExpectedHistorical: client.expectedHistorical / data.forecast.workingDays.inAnalysis,
      })),
      sponsors: data.forecast.byKind.consulting.bySponsor.map((sponsor: any) => ({
        name: sponsor.name,
        slug: sponsor.slug,
        clientSlug: sponsor.clientSlug,
        sameDayThreeMonthsAgo: sponsor.sameDayThreeMonthsAgo,
        normalizedSameDayThreeMonthsAgo: sponsor.sameDayThreeMonthsAgo / data.forecast.workingDays.sameDayThreeMonthsAgo,
        threeMonthsAgo: sponsor.threeMonthsAgo,
        normalizedThreeMonthsAgo: sponsor.threeMonthsAgo / data.forecast.workingDays.threeMonthsAgo,
        sameDayTwoMonthsAgo: sponsor.sameDayTwoMonthsAgo,
        normalizedSameDayTwoMonthsAgo: sponsor.sameDayTwoMonthsAgo / data.forecast.workingDays.sameDayTwoMonthsAgo,
        twoMonthsAgo: sponsor.twoMonthsAgo,
        normalizedTwoMonthsAgo: sponsor.twoMonthsAgo / data.forecast.workingDays.twoMonthsAgo,
        sameDayOneMonthAgo: sponsor.sameDayOneMonthAgo,
        normalizedSameDayOneMonthAgo: sponsor.sameDayOneMonthAgo / data.forecast.workingDays.sameDayOneMonthAgo,
        oneMonthAgo: sponsor.oneMonthAgo,
        normalizedOneMonthAgo: sponsor.oneMonthAgo / data.forecast.workingDays.oneMonthAgo,
        realized: sponsor.inAnalysis,
        normalizedRealized: sponsor.inAnalysis / data.forecast.workingDays.inAnalysisPartial,
        projected: sponsor.projected,
        normalizedProjected: sponsor.projected / data.forecast.workingDays.inAnalysis,
        expected: sponsor.expected,
        normalizedExpected: sponsor.expected / data.forecast.workingDays.inAnalysis,
        expectedHistorical: sponsor.expectedHistorical,
        normalizedExpectedHistorical: sponsor.expectedHistorical / data.forecast.workingDays.inAnalysis,
      })),
      cases: data.forecast.byKind.consulting.byCase.map((caseItem: any) => ({
        title: caseItem.title,
        slug: caseItem.slug,
        sponsorSlug: caseItem.sponsorSlug,
        clientSlug: caseItem.clientSlug,
        sameDayThreeMonthsAgo: caseItem.sameDayThreeMonthsAgo,
        normalizedSameDayThreeMonthsAgo: caseItem.sameDayThreeMonthsAgo / data.forecast.workingDays.sameDayThreeMonthsAgo,
        threeMonthsAgo: caseItem.threeMonthsAgo,
        normalizedThreeMonthsAgo: caseItem.threeMonthsAgo / data.forecast.workingDays.threeMonthsAgo,
        sameDayTwoMonthsAgo: caseItem.sameDayTwoMonthsAgo,
        normalizedSameDayTwoMonthsAgo: caseItem.sameDayTwoMonthsAgo / data.forecast.workingDays.sameDayTwoMonthsAgo,
        twoMonthsAgo: caseItem.twoMonthsAgo,
        normalizedTwoMonthsAgo: caseItem.twoMonthsAgo / data.forecast.workingDays.twoMonthsAgo,
        sameDayOneMonthAgo: caseItem.sameDayOneMonthAgo,
        normalizedSameDayOneMonthAgo: caseItem.sameDayOneMonthAgo / data.forecast.workingDays.sameDayOneMonthAgo,
        oneMonthAgo: caseItem.oneMonthAgo,
        normalizedOneMonthAgo: caseItem.oneMonthAgo / data.forecast.workingDays.oneMonthAgo,
        realized: caseItem.inAnalysis,
        normalizedRealized: caseItem.inAnalysis / data.forecast.workingDays.inAnalysisPartial,
        projected: caseItem.projected,
        normalizedProjected: caseItem.projected / data.forecast.workingDays.inAnalysis,
        expected: caseItem.expected,
        normalizedExpected: caseItem.expected / data.forecast.workingDays.inAnalysis,
        expectedHistorical: caseItem.expectedHistorical,
        normalizedExpectedHistorical: caseItem.expectedHistorical / data.forecast.workingDays.inAnalysis,
      })),
      projects: data.forecast.byKind.consulting.byProject.map((project: any) => ({
        name: project.name,
        slug: project.slug,
        caseSlug: project.caseSlug,
        sameDayThreeMonthsAgo: project.sameDayThreeMonthsAgo,
        normalizedSameDayThreeMonthsAgo: project.sameDayThreeMonthsAgo / data.forecast.workingDays.sameDayThreeMonthsAgo,
        threeMonthsAgo: project.threeMonthsAgo,
        normalizedThreeMonthsAgo: project.threeMonthsAgo / data.forecast.workingDays.threeMonthsAgo,
        sameDayTwoMonthsAgo: project.sameDayTwoMonthsAgo,
        normalizedSameDayTwoMonthsAgo: project.sameDayTwoMonthsAgo / data.forecast.workingDays.sameDayTwoMonthsAgo,
        twoMonthsAgo: project.twoMonthsAgo,
        normalizedTwoMonthsAgo: project.twoMonthsAgo / data.forecast.workingDays.twoMonthsAgo,
        sameDayOneMonthAgo: project.sameDayOneMonthAgo,
        normalizedSameDayOneMonthAgo: project.sameDayOneMonthAgo / data.forecast.workingDays.sameDayOneMonthAgo,
        oneMonthAgo: project.oneMonthAgo,
        normalizedOneMonthAgo: project.oneMonthAgo / data.forecast.workingDays.oneMonthAgo,
        realized: project.inAnalysis,
        normalizedRealized: project.inAnalysis / data.forecast.workingDays.inAnalysisPartial,
        projected: project.projected,
        normalizedProjected: project.projected / data.forecast.workingDays.inAnalysis,
        expected: project.expected,
        normalizedExpected: project.expected / data.forecast.workingDays.inAnalysis,
        expectedHistorical: project.expectedHistorical,
        normalizedExpectedHistorical: project.expectedHistorical / data.forecast.workingDays.inAnalysis,
      })),
      totals: {
        sameDayThreeMonthsAgo: data.forecast.byKind.consulting.totals.sameDayThreeMonthsAgo,
        normalizedSameDayThreeMonthsAgo: data.forecast.byKind.consulting.totals.sameDayThreeMonthsAgo / data.forecast.workingDays.sameDayThreeMonthsAgo,
        threeMonthsAgo: data.forecast.byKind.consulting.totals.threeMonthsAgo,
        normalizedThreeMonthsAgo: data.forecast.byKind.consulting.totals.threeMonthsAgo / data.forecast.workingDays.threeMonthsAgo,
        sameDayTwoMonthsAgo: data.forecast.byKind.consulting.totals.sameDayTwoMonthsAgo,
        normalizedSameDayTwoMonthsAgo: data.forecast.byKind.consulting.totals.sameDayTwoMonthsAgo / data.forecast.workingDays.sameDayTwoMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.consulting.totals.twoMonthsAgo,
        normalizedTwoMonthsAgo: data.forecast.byKind.consulting.totals.twoMonthsAgo / data.forecast.workingDays.twoMonthsAgo,
        sameDayOneMonthAgo: data.forecast.byKind.consulting.totals.sameDayOneMonthAgo,
        normalizedSameDayOneMonthAgo: data.forecast.byKind.consulting.totals.sameDayOneMonthAgo / data.forecast.workingDays.sameDayOneMonthAgo,
        oneMonthAgo: data.forecast.byKind.consulting.totals.oneMonthAgo,
        normalizedOneMonthAgo: data.forecast.byKind.consulting.totals.oneMonthAgo / data.forecast.workingDays.oneMonthAgo,
        realized: data.forecast.byKind.consulting.totals.inAnalysis,
        normalizedRealized: data.forecast.byKind.consulting.totals.inAnalysis / data.forecast.workingDays.inAnalysisPartial,
        projected: data.forecast.byKind.consulting.totals.projected,
        normalizedProjected: data.forecast.byKind.consulting.totals.projected / data.forecast.workingDays.inAnalysis,
        expected: data.forecast.byKind.consulting.totals.expected,
        normalizedExpected: data.forecast.byKind.consulting.totals.expected / data.forecast.workingDays.inAnalysis,
        expectedHistorical: data.forecast.byKind.consulting.totals.expectedHistorical,
        normalizedExpectedHistorical: data.forecast.byKind.consulting.totals.expectedHistorical / data.forecast.workingDays.inAnalysis,
      },
    },
    consultingPre: {
      clients: data.forecast.byKind.consultingPre.byClient.map(
        (client: any) => ({
          name: client.name,
          slug: client.slug,
          threeMonthsAgo: client.threeMonthsAgo,
          twoMonthsAgo: client.twoMonthsAgo,
          oneMonthAgo: client.oneMonthAgo,
          current: client.inAnalysis,
        })
      ),
      sponsors: data.forecast.byKind.consultingPre.bySponsor.map(
        (sponsor: any) => ({
          name: sponsor.name,
          slug: sponsor.slug,
          clientSlug: sponsor.clientSlug,
          threeMonthsAgo: sponsor.threeMonthsAgo,
          twoMonthsAgo: sponsor.twoMonthsAgo,
          oneMonthAgo: sponsor.oneMonthAgo,
          current: sponsor.inAnalysis,
        })
      ),
      cases: data.forecast.byKind.consultingPre.byCase.map(
        (caseItem: any) => ({
          title: caseItem.title,
          slug: caseItem.slug,
          sponsorSlug: caseItem.sponsorSlug,
          clientSlug: caseItem.clientSlug,
          threeMonthsAgo: caseItem.threeMonthsAgo,
          twoMonthsAgo: caseItem.twoMonthsAgo,
          oneMonthAgo: caseItem.oneMonthAgo,
          current: caseItem.inAnalysis,
        })
      ),
      projects: data.forecast.byKind.consultingPre.byProject.map(
        (project: any) => ({
          name: project.name,
          slug: project.slug,
          caseSlug: project.caseSlug,
          threeMonthsAgo: project.threeMonthsAgo,
          twoMonthsAgo: project.twoMonthsAgo,
          oneMonthAgo: project.oneMonthAgo,
          current: project.inAnalysis,
        })
      ),
      totals: {
        threeMonthsAgo:
          data.forecast.byKind.consultingPre.totals.threeMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.consultingPre.totals.twoMonthsAgo,
        oneMonthAgo: data.forecast.byKind.consultingPre.totals.oneMonthAgo,
        current: data.forecast.byKind.consultingPre.totals.inAnalysis,
      },
    },
    handsOn: {
      clients: data.forecast.byKind.handsOn.byClient.map((client: any) => ({
        name: client.name,
        slug: client.slug,
        threeMonthsAgo: client.threeMonthsAgo,
        twoMonthsAgo: client.twoMonthsAgo,
        oneMonthAgo: client.oneMonthAgo,
        current: client.inAnalysis,
      })),
      sponsors: data.forecast.byKind.handsOn.bySponsor.map((sponsor: any) => ({
        name: sponsor.name,
        slug: sponsor.slug,
        clientSlug: sponsor.clientSlug,
        threeMonthsAgo: sponsor.threeMonthsAgo,
        twoMonthsAgo: sponsor.twoMonthsAgo,
        oneMonthAgo: sponsor.oneMonthAgo,
        current: sponsor.inAnalysis,
      })),
      cases: data.forecast.byKind.handsOn.byCase.map((caseItem: any) => ({
        title: caseItem.title,
        slug: caseItem.slug,
        sponsorSlug: caseItem.sponsorSlug,
        clientSlug: caseItem.clientSlug,
        threeMonthsAgo: caseItem.threeMonthsAgo,
        twoMonthsAgo: caseItem.twoMonthsAgo,
        oneMonthAgo: caseItem.oneMonthAgo,
        current: caseItem.inAnalysis,
      })),
      projects: data.forecast.byKind.handsOn.byProject.map((project: any) => ({
        name: project.name,
        slug: project.slug,
        caseSlug: project.caseSlug,
        threeMonthsAgo: project.threeMonthsAgo,
        twoMonthsAgo: project.twoMonthsAgo,
        oneMonthAgo: project.oneMonthAgo,
        current: project.inAnalysis,
      })),
      totals: {
        threeMonthsAgo: data.forecast.byKind.handsOn.totals.threeMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.handsOn.totals.twoMonthsAgo,
        oneMonthAgo: data.forecast.byKind.handsOn.totals.oneMonthAgo,
        current: data.forecast.byKind.handsOn.totals.inAnalysis,
      },
    },
    squad: {
      clients: data.forecast.byKind.squad.byClient.map((client: any) => ({
        name: client.name,
        slug: client.slug,
        threeMonthsAgo: client.threeMonthsAgo,
        twoMonthsAgo: client.twoMonthsAgo,
        oneMonthAgo: client.oneMonthAgo,
        current: client.inAnalysis,
      })),
      sponsors: data.forecast.byKind.squad.bySponsor.map((sponsor: any) => ({
        name: sponsor.name,
        slug: sponsor.slug,
        clientSlug: sponsor.clientSlug,
        threeMonthsAgo: sponsor.threeMonthsAgo,
        twoMonthsAgo: sponsor.twoMonthsAgo,
        oneMonthAgo: sponsor.oneMonthAgo,
        current: sponsor.inAnalysis,
      })),
      cases: data.forecast.byKind.squad.byCase.map((caseItem: any) => ({
        title: caseItem.title,
        slug: caseItem.slug,
        sponsorSlug: caseItem.sponsorSlug,
        clientSlug: caseItem.clientSlug,
        threeMonthsAgo: caseItem.threeMonthsAgo,
        twoMonthsAgo: caseItem.twoMonthsAgo,
        oneMonthAgo: caseItem.oneMonthAgo,
        current: caseItem.inAnalysis,
      })),
      projects: data.forecast.byKind.squad.byProject.map((project: any) => ({
        name: project.name,
        slug: project.slug,
        caseSlug: project.caseSlug,
        threeMonthsAgo: project.threeMonthsAgo,
        twoMonthsAgo: project.twoMonthsAgo,
        oneMonthAgo: project.oneMonthAgo,
        current: project.inAnalysis,
      })),
      totals: {
        threeMonthsAgo: data.forecast.byKind.squad.totals.threeMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.squad.totals.twoMonthsAgo,
        oneMonthAgo: data.forecast.byKind.squad.totals.oneMonthAgo,
        current: data.forecast.byKind.squad.totals.inAnalysis,
      },
    },
  };

  return (
    <>
      <div className="relative z-[40]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <DatePicker date={date} onSelectedDateChange={setDate} />
            <div className="flex-grow h-px bg-gray-200 ml-2"></div>
          </div>

          <FilterFieldsSelect
            data={data?.forecast}
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="ml-2 mr-2">

        <div className="mt-4">
          <RevenueProgression data={data} />
        </div>

        <NavBar
          sections={[
            {
              id: "consulting",
              title: "Consulting",
              subtitle:
                formatCurrency(forecastData.consulting.totals.realized) +
                " / " +
                formatCurrency(forecastData.consulting.totals.expected),
            },
            {
              id: "consultingPre",
              title: "Consulting Pre",
              subtitle: formatCurrency(
                forecastData.consultingPre.totals.current
              ),
            },
            {
              id: "handsOn",
              title: "Hands On",
              subtitle: formatCurrency(forecastData.handsOn.totals.current),
            },
            {
              id: "squad",
              title: "Squad",
              subtitle: formatCurrency(forecastData.squad.totals.current),
            },
          ]}
        />
        {renderConsultingTable(
          "Consulting",
          forecastData.consulting,
          "consulting"
        )}
        {renderOtherTable(
          "Consulting Pre",
          forecastData.consultingPre,
          "consultingPre"
        )}
        {renderOtherTable("Hands On", forecastData.handsOn, "handsOn")}
        {renderOtherTable("Squad", forecastData.squad, "squad")}
      </div>
    </>
  );
}
