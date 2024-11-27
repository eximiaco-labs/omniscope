"use client";

import { useQuery } from "@apollo/client";
import {
  format,
  endOfMonth,
  subMonths,
  isSameDay,
  getDaysInMonth,
  getDate,
} from "date-fns";
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

export default function RevenueForecastPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [showPartialPreviousMonth, setShowPartialPreviousMonth] =
    useState(false);
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

  const previousMonthDate = endOfMonth(subMonths(date, 1));
  const twoMonthsAgoDate = endOfMonth(subMonths(date, 2));
  const threeMonthsAgoDate = endOfMonth(subMonths(date, 3));

  const getPreviousMonthPartialDate = () => {
    const previousMonth = subMonths(date, 1);
    const currentDay = date.getDate();
    const daysInPreviousMonth = getDaysInMonth(previousMonth);
    const targetDay = Math.min(currentDay, daysInPreviousMonth);
    return new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth(),
      targetDay
    );
  };

  const getTwoMonthsAgoPartialDate = () => {
    const twoMonthsAgo = subMonths(date, 2);
    const currentDay = date.getDate();
    const daysInTwoMonthsAgo = getDaysInMonth(twoMonthsAgo);
    const targetDay = Math.min(currentDay, daysInTwoMonthsAgo);
    return new Date(
      twoMonthsAgo.getFullYear(),
      twoMonthsAgo.getMonth(),
      targetDay
    );
  };

  const getThreeMonthsAgoPartialDate = () => {
    const threeMonthsAgo = subMonths(date, 3);
    const currentDay = date.getDate();
    const daysInThreeMonthsAgo = getDaysInMonth(threeMonthsAgo);
    const targetDay = Math.min(currentDay, daysInThreeMonthsAgo);
    return new Date(
      threeMonthsAgo.getFullYear(),
      threeMonthsAgo.getMonth(),
      targetDay
    );
  };

  const previousMonthPartialDate = getPreviousMonthPartialDate();
  const twoMonthsAgoPartialDate = getTwoMonthsAgoPartialDate();
  const threeMonthsAgoPartialDate = getThreeMonthsAgoPartialDate();

  const { loading, error, data } = useQuery(REVENUE_FORECAST_QUERY, {
    variables: {
      inAnalysisDate: format(date, "yyyy-MM-dd"),
      previousMonthDate: format(previousMonthDate, "yyyy-MM-dd"),
      previousMonthPartialDate: format(previousMonthPartialDate, "yyyy-MM-dd"),
      twoMonthsAgoDate: format(twoMonthsAgoDate, "yyyy-MM-dd"),
      twoMonthsAgoPartialDate: format(twoMonthsAgoPartialDate, "yyyy-MM-dd"),
      threeMonthsAgoDate: format(threeMonthsAgoDate, "yyyy-MM-dd"),
      threeMonthsAgoPartialDate: format(
        threeMonthsAgoPartialDate,
        "yyyy-MM-dd"
      ),
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Process data for each service type
  const processServiceData = (
    type:
      | "regular"
      | "preContracted"
      | "consultingFee"
      | "consultingPreFee"
      | "handsOnFee"
      | "squadFee"
  ) => {
    const clients = new Map();

    data.three_months_ago.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        clients.set(client.slug, {
          name: client.name,
          slug: client.slug,
          threeMonthsAgoFull: client[type],
          threeMonthsAgoPartial: 0,
          twoMonthsAgoFull: 0,
          twoMonthsAgoPartial: 0,
          previousFull: 0,
          previousPartial: 0,
          current: 0,
          projected: 0,
          expected: 0,
        });
      }
    });

    data.three_months_ago_partial.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          clients.get(client.slug).threeMonthsAgoPartial = client[type];
        } else {
          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            threeMonthsAgoFull: 0,
            threeMonthsAgoPartial: client[type],
            twoMonthsAgoFull: 0,
            twoMonthsAgoPartial: 0,
            previousFull: 0,
            previousPartial: 0,
            current: 0,
            projected: 0,
            expected: 0,
          });
        }
      }
    });

    data.two_months_ago.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          clients.get(client.slug).twoMonthsAgoFull = client[type];
        } else {
          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            threeMonthsAgoFull: 0,
            threeMonthsAgoPartial: 0,
            twoMonthsAgoFull: client[type],
            twoMonthsAgoPartial: 0,
            previousFull: 0,
            previousPartial: 0,
            current: 0,
            projected: 0,
            expected: 0,
          });
        }
      }
    });

    data.two_months_ago_partial.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          clients.get(client.slug).twoMonthsAgoPartial = client[type];
        } else {
          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            threeMonthsAgoFull: 0,
            threeMonthsAgoPartial: 0,
            twoMonthsAgoFull: 0,
            twoMonthsAgoPartial: client[type],
            previousFull: 0,
            previousPartial: 0,
            current: 0,
            projected: 0,
            expected: 0,
          });
        }
      }
    });

    data.previous_month.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          clients.get(client.slug).previousFull = client[type];
        } else {
          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            threeMonthsAgoFull: 0,
            threeMonthsAgoPartial: 0,
            twoMonthsAgoFull: 0,
            twoMonthsAgoPartial: 0,
            previousFull: client[type],
            previousPartial: 0,
            current: 0,
            projected: 0,
            expected: 0,
          });
        }
      }
    });

    data.previous_month_partial.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          clients.get(client.slug).previousPartial = client[type];
        } else {
          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            threeMonthsAgoFull: 0,
            threeMonthsAgoPartial: 0,
            twoMonthsAgoFull: 0,
            twoMonthsAgoPartial: 0,
            previousFull: 0,
            previousPartial: client[type],
            current: 0,
            projected: 0,
            expected: 0,
          });
        }
      }
    });

    data.in_analysis.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          const currentValue = client[type];
          const clientData = clients.get(client.slug);
          clientData.current = currentValue;

          // Calculate projected value based on current day of month
          const currentDay = getDate(date);
          const daysInMonth = getDaysInMonth(date);
          const projectedValue = (currentValue / currentDay) * daysInMonth;
          clientData.projected = projectedValue;

          // Calculate expected value (60% previous month + 25% two months ago + 15% three months ago)
          const previousValue = clientData.previousFull || 0;
          const twoMonthsAgoValue = clientData.twoMonthsAgoFull || 0;
          const threeMonthsAgoValue = clientData.threeMonthsAgoFull || 0;

          // If there's no history, use projected value as expected
          if (
            previousValue === 0 &&
            twoMonthsAgoValue === 0 &&
            threeMonthsAgoValue === 0
          ) {
            clientData.expected = projectedValue;
          }
          // If only has previous month
          else if (twoMonthsAgoValue === 0 && threeMonthsAgoValue === 0) {
            clientData.expected = previousValue;
          }
          // If has previous and two months ago
          else if (threeMonthsAgoValue === 0) {
            clientData.expected = previousValue * 0.8 + twoMonthsAgoValue * 0.2;
          }
          // If has all three months
          else {
            clientData.expected =
              previousValue * 0.6 +
              twoMonthsAgoValue * 0.25 +
              threeMonthsAgoValue * 0.15;
          }
        } else {
          const currentValue = client[type];
          const currentDay = getDate(date);
          const daysInMonth = getDaysInMonth(date);
          const projectedValue = (currentValue / currentDay) * daysInMonth;

          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            threeMonthsAgoFull: 0,
            threeMonthsAgoPartial: 0,
            twoMonthsAgoFull: 0,
            twoMonthsAgoPartial: 0,
            previousFull: 0,
            previousPartial: 0,
            current: currentValue,
            projected: projectedValue,
            expected: projectedValue, // Use projected value as expected when no history
          });
        }
      }
    });

    return clients;
  };

  const consultingClients = processServiceData("consultingFee");
  const consultingPreClients = processServiceData("consultingPreFee");
  const handsOnClients = processServiceData("handsOnFee");
  const squadClients = processServiceData("squadFee");

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

  const getSortedClients = (clients: Map<string, any>, tableId: string) => {
    const clientsArray = Array.from(clients.values());
    const sortConfig = sortConfigs[tableId];
    if (!sortConfig?.key) return clientsArray;

    return clientsArray.sort((a, b) => {
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
    clients: Map<string, any>,
    tableId: string
  ) => {
    const sortedClients = getSortedClients(clients, tableId);
    const sortConfig = sortConfigs[tableId];
    const total = sortedClients.reduce(
      (acc, client) => ({
        threeMonthsAgoFull: acc.threeMonthsAgoFull + client.threeMonthsAgoFull,
        threeMonthsAgoPartial:
          acc.threeMonthsAgoPartial + client.threeMonthsAgoPartial,
        twoMonthsAgoFull: acc.twoMonthsAgoFull + client.twoMonthsAgoFull,
        twoMonthsAgoPartial:
          acc.twoMonthsAgoPartial + client.twoMonthsAgoPartial,
        previousFull: acc.previousFull + client.previousFull,
        previousPartial: acc.previousPartial + client.previousPartial,
        current: acc.current + client.current,
        projected: acc.projected + client.projected,
        expected: acc.expected + client.expected,
      }),
      {
        threeMonthsAgoFull: 0,
        threeMonthsAgoPartial: 0,
        twoMonthsAgoFull: 0,
        twoMonthsAgoPartial: 0,
        previousFull: 0,
        previousPartial: 0,
        current: 0,
        projected: 0,
        expected: 0,
      }
    );

    return (
      <div className="mb-8">
        <SectionHeader title={title} subtitle={""} />
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
                  {format(threeMonthsAgoDate, "MMM yyyy")}
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center border-x border-gray-400"
                >
                  {format(twoMonthsAgoDate, "MMM yyyy")}
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center border-x border-gray-400"
                >
                  {format(previousMonthDate, "MMM yyyy")}
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="text-center border-x border-gray-400"
                >
                  {format(date, "MMM yyyy")}
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead
                  onClick={() => requestSort("threeMonthsAgoPartial", tableId)}
                  className="text-right w-[95px] border-x border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                  Until {format(threeMonthsAgoPartialDate, "dd")}{" "}
                  {sortConfig.key === "threeMonthsAgoPartial" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("threeMonthsAgoFull", tableId)}
                  className="text-right w-[95px] border-r border-gray-400 cursor-pointer hover:bg-gray-100"
                >
                  Full Month{" "}
                  {sortConfig.key === "threeMonthsAgoFull" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("twoMonthsAgoPartial", tableId)}
                  className="text-right w-[95px] border-x border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                  Until {format(twoMonthsAgoPartialDate, "dd")}{" "}
                  {sortConfig.key === "twoMonthsAgoPartial" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("twoMonthsAgoFull", tableId)}
                  className="text-right w-[95px] border-r border-gray-400 cursor-pointer hover:bg-gray-100"
                >
                  Full Month{" "}
                  {sortConfig.key === "twoMonthsAgoFull" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("previousPartial", tableId)}
                  className="text-right w-[95px] border-x border-gray-200 cursor-pointer hover:bg-gray-100"
                >
                  Until {format(previousMonthPartialDate, "dd")}{" "}
                  {sortConfig.key === "previousPartial" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("previousFull", tableId)}
                  className="text-right w-[95px] border-r border-gray-400 cursor-pointer hover:bg-gray-100"
                >
                  Full Month{" "}
                  {sortConfig.key === "previousFull" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("current", tableId)}
                  className="text-right cursor-pointer hover:bg-gray-100 w-[120px] border-x border-gray-200"
                >
                  Realized{" "}
                  {sortConfig.key === "current" &&
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
                    {client.slug ? (
                      <Link
                        href={`/about-us/clients/${client.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {client.name}
                      </Link>
                    ) : (
                      <span>{client.name}</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 text-[12px] ${
                      client.threeMonthsAgoPartial === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.threeMonthsAgoPartial)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.threeMonthsAgoPartial,
                        total.threeMonthsAgoPartial
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 text-[12px] ${
                      client.threeMonthsAgoFull === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.threeMonthsAgoFull)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.threeMonthsAgoFull,
                        total.threeMonthsAgoFull
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 text-[12px] ${
                      client.twoMonthsAgoPartial === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.twoMonthsAgoPartial)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.twoMonthsAgoPartial,
                        total.twoMonthsAgoPartial
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 text-[12px] ${
                      client.twoMonthsAgoFull === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.twoMonthsAgoFull)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.twoMonthsAgoFull,
                        total.twoMonthsAgoFull
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 text-[12px] ${
                      client.previousPartial === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.previousPartial)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.previousPartial,
                        total.previousPartial
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-r border-gray-400 text-[12px] ${
                      client.previousFull === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.previousFull)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.previousFull,
                        total.previousFull
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x border-gray-200 ${
                      client.current === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.current)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(client.current, total.current)}
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
                  {formatCurrency(total.threeMonthsAgoPartial)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 text-[12px]">
                  {formatCurrency(total.threeMonthsAgoFull)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200 text-[12px]">
                  {formatCurrency(total.twoMonthsAgoPartial)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 text-[12px]">
                  {formatCurrency(total.twoMonthsAgoFull)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200 text-[12px]">
                  {formatCurrency(total.previousPartial)}
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 text-[12px]">
                  {formatCurrency(total.previousFull)}
                </TableCell>
                <TableCell className="text-right border-x border-gray-200">
                  {formatCurrency(total.current)}
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

  const renderOtherTable = (
    title: string,
    clients: Map<string, any>,
    tableId: string
  ) => {
    const sortedClients = getSortedClients(clients, tableId);
    const sortConfig = sortConfigs[tableId];
    const total = sortedClients.reduce(
      (acc, client) => ({
        threeMonthsAgoFull: acc.threeMonthsAgoFull + client.threeMonthsAgoFull,
        twoMonthsAgoFull: acc.twoMonthsAgoFull + client.twoMonthsAgoFull,
        previousFull: acc.previousFull + client.previousFull,
        current: acc.current + client.current,
      }),
      {
        threeMonthsAgoFull: 0,
        twoMonthsAgoFull: 0,
        previousFull: 0,
        current: 0,
      }
    );

    return (
      <div className="mb-8">
        <SectionHeader title={title} subtitle={""} />
        <div className="px-2">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead
                  onClick={() => requestSort("threeMonthsAgoFull", tableId)}
                  className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
                >
                  {format(threeMonthsAgoDate, "MMM yyyy")}{" "}
                  {sortConfig.key === "threeMonthsAgoFull" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("twoMonthsAgoFull", tableId)}
                  className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
                >
                  {format(twoMonthsAgoDate, "MMM yyyy")}{" "}
                  {sortConfig.key === "twoMonthsAgoFull" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("previousFull", tableId)}
                  className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
                >
                  {format(previousMonthDate, "MMM yyyy")}{" "}
                  {sortConfig.key === "previousFull" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("current", tableId)}
                  className="text-center border-x w-[120px] cursor-pointer hover:bg-gray-100"
                >
                  {format(date, "MMM yyyy")}{" "}
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
                    {client.slug ? (
                      <Link
                        href={`/about-us/clients/${client.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {client.name}
                      </Link>
                    ) : (
                      <span>{client.name}</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right border-x text-[12px] ${
                      client.threeMonthsAgoFull === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.threeMonthsAgoFull)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.threeMonthsAgoFull,
                        total.threeMonthsAgoFull
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x text-[12px] ${
                      client.twoMonthsAgoFull === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.twoMonthsAgoFull)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.twoMonthsAgoFull,
                        total.twoMonthsAgoFull
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right border-x text-[12px] ${
                      client.previousFull === 0 ? "text-gray-300" : ""
                    } relative`}
                  >
                    {formatCurrency(client.previousFull)}
                    <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
                      {formatPercentage(
                        client.previousFull,
                        total.previousFull
                      )}
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
                  {formatCurrency(total.threeMonthsAgoFull)}
                </TableCell>
                <TableCell className="text-right border-x text-[12px]">
                  {formatCurrency(total.twoMonthsAgoFull)}
                </TableCell>
                <TableCell className="text-right border-x text-[12px]">
                  {formatCurrency(total.previousFull)}
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
      </div>

      <div className="ml-2 mr-2">
        {renderConsultingTable("Consulting", consultingClients, "consulting")}
        {renderOtherTable(
          "Consulting Pre",
          consultingPreClients,
          "consultingPre"
        )}
        {renderOtherTable("Hands On", handsOnClients, "handsOn")}
        {renderOtherTable("Squad", squadClients, "squad")}
      </div>
    </div>
  );
}
