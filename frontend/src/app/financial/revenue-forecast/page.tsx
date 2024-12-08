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

  const renderConsultingTable = (
    title: string,
    tableData: any,
    tableId: string
  ) => {
    const sortedClients = getSortedClients(tableData.clients, tableId);
    const sortConfig = sortConfigs[tableId];
    const total = tableData.totals;
    const dates = data.forecast.dates;

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
                <TableHead rowSpan={2} className="w-[50px] text-center">
                  #
                </TableHead>
                <TableHead rowSpan={2} className="border-r border-gray-400">
                  Client
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center border-x border-gray-400"
                >
                  {format(new Date(dates.threeMonthsAgo), "MMM yyyy")}
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center border-x border-gray-400"
                >
                  {format(new Date(dates.twoMonthsAgo), "MMM yyyy")}
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center border-x border-gray-400"
                >
                  {format(new Date(dates.oneMonthAgo), "MMM yyyy")}
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="text-center border-x border-gray-400"
                >
                  {format(new Date(data.forecast.dateOfInterest), "MMM yyyy")}
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead
                  onClick={() => requestSort("sameDayThreeMonthsAgo", tableId)}
                  className="text-right w-[95px] border-x border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                  Until {format(new Date(dates.sameDayThreeMonthsAgo), "dd")}{" "}
                  {sortConfig.key === "sameDayThreeMonthsAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("threeMonthsAgo", tableId)}
                  className="text-right w-[95px] border-r border-gray-400 cursor-pointer hover:bg-gray-100"
                >
                  Full Month{" "}
                  {sortConfig.key === "threeMonthsAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("sameDayTwoMonthsAgo", tableId)}
                  className="text-right w-[95px] border-x border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                  Until {format(new Date(dates.sameDayTwoMonthsAgo), "dd")}{" "}
                  {sortConfig.key === "sameDayTwoMonthsAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("twoMonthsAgo", tableId)}
                  className="text-right w-[95px] border-r border-gray-400 cursor-pointer hover:bg-gray-100"
                >
                  Full Month{" "}
                  {sortConfig.key === "twoMonthsAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("sameDayOneMonthAgo", tableId)}
                  className="text-right w-[95px] border-x border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                  Until {format(new Date(dates.sameDayOneMonthAgo), "dd")}{" "}
                  {sortConfig.key === "sameDayOneMonthAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("oneMonthAgo", tableId)}
                  className="text-right w-[95px] border-r border-gray-400 cursor-pointer hover:bg-gray-100"
                >
                  Full Month{" "}
                  {sortConfig.key === "oneMonthAgo" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("realized", tableId)}
                  className="text-right cursor-pointer hover:bg-gray-100 w-[120px] border-x border-gray-200"
                >
                  Realized{" "}
                  {sortConfig.key === "realized" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("projected", tableId)}
                  className="text-right cursor-pointer hover:bg-gray-100 w-[120px] border-x border-gray-200"
                >
                  Projected{" "}
                  {sortConfig.key === "projected" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("expected", tableId)}
                  className="text-right cursor-pointer hover:bg-gray-100 w-[120px] border-r border-gray-400"
                >
                  Expected{" "}
                  {sortConfig.key === "expected" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client: any, index: number) => (
                <TableRow key={client.name} className="h-[57px] border-b-[1px]">
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-r border-gray-400">
                    <span>{client.name}</span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 text-[12px] ${
                      client.sameDayThreeMonthsAgo === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.sameDayThreeMonthsAgo)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.sameDayThreeMonthsAgo,
                        total.sameDayThreeMonthsAgo
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 text-[12px] ${
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
                    className={`text-right border-x border-gray-200 text-[12px] ${
                      client.sameDayTwoMonthsAgo === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.sameDayTwoMonthsAgo)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.sameDayTwoMonthsAgo,
                        total.sameDayTwoMonthsAgo
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 text-[12px] ${
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
                    className={`text-right border-x border-gray-200 text-[12px] ${
                      client.sameDayOneMonthAgo === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.sameDayOneMonthAgo)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.sameDayOneMonthAgo,
                        total.sameDayOneMonthAgo
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 text-[12px] ${
                      client.oneMonthAgo === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.oneMonthAgo)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(client.oneMonthAgo, total.oneMonthAgo)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 ${
                      client.realized === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.realized)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(client.realized, total.realized)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 ${
                      client.projected === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.projected)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(client.projected, total.projected)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 relative`}
                  >
                    {formatCurrency(client.expected)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(client.expected, total.expected)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-4 h-[57px]">
                <TableCell></TableCell>
                <TableCell className="border-r border-gray-400">
                  Total
                </TableCell>
                <TableCell className="text-right border-x border-gray-200 text-[12px]">
                  {formatCurrency(total.sameDayThreeMonthsAgo)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 text-[12px]">
                  {formatCurrency(total.threeMonthsAgo)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200 text-[12px]">
                  {formatCurrency(total.sameDayTwoMonthsAgo)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 text-[12px]">
                  {formatCurrency(total.twoMonthsAgo)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200 text-[12px]">
                  {formatCurrency(total.sameDayOneMonthAgo)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 text-[12px]">
                  {formatCurrency(total.oneMonthAgo)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200">
                  {formatCurrency(total.realized)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200">
                  {formatCurrency(total.projected)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400">
                  {formatCurrency(total.expected)}
                </TableCell>
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
        <SectionHeader 
          title={title} 
          subtitle={formatCurrency(total.current)} 
        />
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
                <TableRow key={client.name} className="h-[57px]">
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <span>{client.name}</span>
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
          threeMonthsAgo: client.threeMonthsAgo,
          twoMonthsAgo: client.twoMonthsAgo,
          oneMonthAgo: client.oneMonthAgo,
          current: client.inAnalysis,
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
        threeMonthsAgo: client.threeMonthsAgo,
        twoMonthsAgo: client.twoMonthsAgo,
        oneMonthAgo: client.oneMonthAgo,
        current: client.inAnalysis,
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
        threeMonthsAgo: client.threeMonthsAgo,
        twoMonthsAgo: client.twoMonthsAgo,
        oneMonthAgo: client.oneMonthAgo,
        current: client.inAnalysis,
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
      <div className="relative z-[60]">
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
        <NavBar sections={[
          {
            id: "consulting",
            title: "Consulting",
            subtitle: formatCurrency(forecastData.consulting.totals.realized) + " / " + formatCurrency(forecastData.consulting.totals.expected)
          },
          {
            id: "consultingPre",
            title: "Consulting Pre", 
            subtitle: formatCurrency(forecastData.consultingPre.totals.current)
          },
          {
            id: "handsOn",
            title: "Hands On",
            subtitle: formatCurrency(forecastData.handsOn.totals.current)
          },
          {
            id: "squad", 
            title: "Squad",
            subtitle: formatCurrency(forecastData.squad.totals.current)
          }
        ]} />
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
