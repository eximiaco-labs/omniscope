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
import { ConsultingTable } from "./ConsultingTable";
import { getForecastData, processForecastData } from "./forecastData";

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

  const forecastData = processForecastData(data);

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
        
        <ConsultingTable
          title="Consulting"
          tableData={forecastData.consulting}
          tableId="consulting"
          dates={data.forecast.dates}
          workingDays={data.forecast.workingDays}
          sortConfigs={sortConfigs}
          expandedClients={expandedClients}
          useHistorical={useHistorical}
          normalized={normalized}
          requestSort={requestSort}
          toggleClient={toggleClient}
          setNormalized={setNormalized}
          setUseHistorical={setUseHistorical}
        />
        
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
