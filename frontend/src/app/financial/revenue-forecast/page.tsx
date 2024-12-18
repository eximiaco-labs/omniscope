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

    const renderCell = (value: number, totalValue: number, className: string = "") => (
      <TableCell
        className={`text-right ${className} ${
          value === 0 ? "text-gray-300" : ""
        } relative`}
      >
        {formatCurrency(value)}
        <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
          {formatPercentage(value, totalValue)}
        </span>
      </TableCell>
    );

    const renderSortHeader = (key: string, label: string, workingDays: number | null = null, className: string = "") => (
      <TableHead
        onClick={() => requestSort(key, tableId)}
        className={`text-right cursor-pointer hover:bg-gray-100 ${className}`}
      >
        {label}
        {workingDays !== null && <span className="block text-[10px] text-gray-500">{workingDays} working days</span>}
        {sortConfig.key === key && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
          {renderCell(item.sameDayThreeMonthsAgo, total.sameDayThreeMonthsAgo, "border-x border-gray-200 text-[12px]")}
          {renderCell(item.threeMonthsAgo, total.threeMonthsAgo, "border-r border-gray-400 text-[12px]")}
          {renderCell(item.sameDayTwoMonthsAgo, total.sameDayTwoMonthsAgo, "border-x border-gray-200 text-[12px]")}
          {renderCell(item.twoMonthsAgo, total.twoMonthsAgo, "border-r border-gray-400 text-[12px]")}
          {renderCell(item.sameDayOneMonthAgo, total.sameDayOneMonthAgo, "border-x border-gray-200 text-[12px]")}
          {renderCell(item.oneMonthAgo, total.oneMonthAgo, "border-r border-gray-400 text-[12px]")}
          {renderCell(item.realized, total.realized, "border-x border-gray-200")}
          {renderCell(item.projected, total.projected, "border-x border-gray-200")}
          {renderCell(item.expected, total.expected, "border-r border-gray-400")}
        </TableRow>
      );
    };

    return (
      <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
        <SectionHeader
          title={title}
          subtitle={`${formatCurrency(total.realized)} / ${formatCurrency(total.expected)}`}
        />
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
                {renderSortHeader("sameDayThreeMonthsAgo", `Until ${format(new Date(dates.sameDayThreeMonthsAgo), "dd")}`, workingDays.sameDayThreeMonthsAgo, "w-[95px] border-x border-gray-200")}
                {renderSortHeader("threeMonthsAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
                {renderSortHeader("sameDayTwoMonthsAgo", `Until ${format(new Date(dates.sameDayTwoMonthsAgo), "dd")}`, workingDays.sameDayTwoMonthsAgo, "w-[95px] border-x border-gray-200")}
                {renderSortHeader("twoMonthsAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
                {renderSortHeader("sameDayOneMonthAgo", `Until ${format(new Date(dates.sameDayOneMonthAgo), "dd")}`, workingDays.sameDayOneMonthAgo, "w-[95px] border-x border-gray-200")}
                {renderSortHeader("oneMonthAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
                {renderSortHeader("realized", "Realized", workingDays.inAnalysisPartial, "w-[120px] border-x border-gray-200")}
                {renderSortHeader("projected", "Projected", null, "w-[120px] border-x border-gray-200")}
                {renderSortHeader("expected", "Expected", null, "w-[120px] border-r border-gray-400")}
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
                {renderCell(total.sameDayThreeMonthsAgo, total.sameDayThreeMonthsAgo, "border-x border-gray-200 text-[12px]")}
                {renderCell(total.threeMonthsAgo, total.threeMonthsAgo, "border-r border-gray-400 text-[12px]")}
                {renderCell(total.sameDayTwoMonthsAgo, total.sameDayTwoMonthsAgo, "border-x border-gray-200 text-[12px]")}
                {renderCell(total.twoMonthsAgo, total.twoMonthsAgo, "border-r border-gray-400 text-[12px]")}
                {renderCell(total.sameDayOneMonthAgo, total.sameDayOneMonthAgo, "border-x border-gray-200 text-[12px]")}
                {renderCell(total.oneMonthAgo, total.oneMonthAgo, "border-r border-gray-400 text-[12px]")}
                {renderCell(total.realized, total.realized, "border-x border-gray-200")}
                {renderCell(total.projected, total.projected, "border-x border-gray-200")}
                {renderCell(total.expected, total.expected, "border-r border-gray-400")}
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
        threeMonthsAgo: client.threeMonthsAgo,
        sameDayTwoMonthsAgo: client.sameDayTwoMonthsAgo,
        twoMonthsAgo: client.twoMonthsAgo,
        sameDayOneMonthAgo: client.sameDayOneMonthAgo,
        oneMonthAgo: client.oneMonthAgo,
        realized: client.inAnalysis,
        projected: client.projected,
        expected: client.expected,
      })),
      sponsors: data.forecast.byKind.consulting.bySponsor.map((sponsor: any) => ({
        name: sponsor.name,
        slug: sponsor.slug,
        clientSlug: sponsor.clientSlug,
        sameDayThreeMonthsAgo: sponsor.sameDayThreeMonthsAgo,
        threeMonthsAgo: sponsor.threeMonthsAgo,
        sameDayTwoMonthsAgo: sponsor.sameDayTwoMonthsAgo,
        twoMonthsAgo: sponsor.twoMonthsAgo,
        sameDayOneMonthAgo: sponsor.sameDayOneMonthAgo,
        oneMonthAgo: sponsor.oneMonthAgo,
        realized: sponsor.inAnalysis,
        projected: sponsor.projected,
        expected: sponsor.expected,
      })),
      cases: data.forecast.byKind.consulting.byCase.map((caseItem: any) => ({
        title: caseItem.title,
        slug: caseItem.slug,
        sponsorSlug: caseItem.sponsorSlug,
        clientSlug: caseItem.clientSlug,
        sameDayThreeMonthsAgo: caseItem.sameDayThreeMonthsAgo,
        threeMonthsAgo: caseItem.threeMonthsAgo,
        sameDayTwoMonthsAgo: caseItem.sameDayTwoMonthsAgo,
        twoMonthsAgo: caseItem.twoMonthsAgo,
        sameDayOneMonthAgo: caseItem.sameDayOneMonthAgo,
        oneMonthAgo: caseItem.oneMonthAgo,
        realized: caseItem.inAnalysis,
        projected: caseItem.projected,
        expected: caseItem.expected,
      })),
      projects: data.forecast.byKind.consulting.byProject.map((project: any) => ({
        name: project.name,
        slug: project.slug,
        caseSlug: project.caseSlug,
        sameDayThreeMonthsAgo: project.sameDayThreeMonthsAgo,
        threeMonthsAgo: project.threeMonthsAgo,
        sameDayTwoMonthsAgo: project.sameDayTwoMonthsAgo,
        twoMonthsAgo: project.twoMonthsAgo,
        sameDayOneMonthAgo: project.sameDayOneMonthAgo,
        oneMonthAgo: project.oneMonthAgo,
        realized: project.inAnalysis,
        projected: project.projected,
        expected: project.expected,
      })),
      totals: {
        sameDayThreeMonthsAgo:
          data.forecast.byKind.consulting.totals.sameDayThreeMonthsAgo,
        threeMonthsAgo: data.forecast.byKind.consulting.totals.threeMonthsAgo,
        sameDayTwoMonthsAgo:
          data.forecast.byKind.consulting.totals.sameDayTwoMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.consulting.totals.twoMonthsAgo,
        sameDayOneMonthAgo:
          data.forecast.byKind.consulting.totals.sameDayOneMonthAgo,
        oneMonthAgo: data.forecast.byKind.consulting.totals.oneMonthAgo,
        realized: data.forecast.byKind.consulting.totals.inAnalysis,
        projected: data.forecast.byKind.consulting.totals.projected,
        expected: data.forecast.byKind.consulting.totals.expected,
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
