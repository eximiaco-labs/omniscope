"use client";

import { useQuery } from "@apollo/client";
import { format, endOfMonth, subMonths, isSameDay, getDaysInMonth } from "date-fns";
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

export default function RevenueForecastPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [showPartialPreviousMonth, setShowPartialPreviousMonth] = useState(false);
  const [sortConfigs, setSortConfigs] = useState<Record<string, {
    key: string;
    direction: 'asc' | 'desc';
  }>>({
    consulting: { key: 'current', direction: 'desc' },
    consultingPre: { key: 'current', direction: 'desc' },
    handsOn: { key: 'current', direction: 'desc' },
    squad: { key: 'current', direction: 'desc' }
  });

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const previousMonthDate = endOfMonth(subMonths(date, 1));
  
  const getPreviousMonthPartialDate = () => {
    const previousMonth = subMonths(date, 1);
    const currentDay = date.getDate();
    const daysInPreviousMonth = getDaysInMonth(previousMonth);
    const targetDay = Math.min(currentDay, daysInPreviousMonth);
    return new Date(previousMonth.getFullYear(), previousMonth.getMonth(), targetDay);
  };

  const previousMonthPartialDate = getPreviousMonthPartialDate();

  const { loading, error, data } = useQuery(REVENUE_FORECAST_QUERY, {
    variables: {
      inAnalysisDate: format(date, "yyyy-MM-dd"),
      previousMonthDate: format(previousMonthDate, "yyyy-MM-dd"),
      previousMonthPartialDate: format(previousMonthPartialDate, "yyyy-MM-dd"),
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Process data for each service type
  const processServiceData = (type: 'regular' | 'preContracted' | 'consultingFee' | 'consultingPreFee' | 'handsOnFee' | 'squadFee') => {
    const clients = new Map();

    data.previous_month.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        clients.set(client.slug, {
          name: client.name,
          slug: client.slug,
          previousFull: client[type],
          previousPartial: 0,
          current: 0
        });
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
            previousFull: 0,
            previousPartial: client[type],
            current: 0
          });
        }
      }
    });

    data.in_analysis.summaries.byClient.forEach((client: any) => {
      if (client[type]) {
        if (clients.has(client.slug)) {
          clients.get(client.slug).current = client[type];
        } else {
          clients.set(client.slug, {
            name: client.name,
            slug: client.slug,
            previousFull: 0,
            previousPartial: 0,
            current: client[type]
          });
        }
      }
    });

    return clients;
  };

  const consultingClients = processServiceData('consultingFee');
  const consultingPreClients = processServiceData('consultingPreFee');
  const handsOnClients = processServiceData('handsOnFee');
  const squadClients = processServiceData('squadFee');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const requestSort = (key: string, tableId: string) => {
    setSortConfigs(prevConfigs => {
      const newConfigs = { ...prevConfigs };
      let direction: 'asc' | 'desc' = 'desc';
      if (newConfigs[tableId].key === key && newConfigs[tableId].direction === 'desc') {
        direction = 'asc';
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
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const renderTable = (title: string, clients: Map<string, any>, tableId: string) => {
    const sortedClients = getSortedClients(clients, tableId);
    const sortConfig = sortConfigs[tableId];
    const total = sortedClients.reduce((acc, client) => ({
      previousFull: acc.previousFull + client.previousFull,
      previousPartial: acc.previousPartial + client.previousPartial,
      current: acc.current + client.current
    }), { previousFull: 0, previousPartial: 0, current: 0 });

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead colSpan={2} className="text-center border-x">
                {format(previousMonthDate, 'MMM yyyy')}
              </TableHead>
              <TableHead onClick={() => requestSort('current', tableId)} className="text-right cursor-pointer hover:bg-gray-100 w-[120px]">
                {format(date, "MMM yyyy")} {sortConfig.key === 'current' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right w-[120px]">Difference</TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-right w-[120px] border-x">Until {format(previousMonthPartialDate, "dd")}</TableHead>
              <TableHead className="text-right w-[120px] border-r">Full Month</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client: any, index: number) => {
              const diff = client.current - client.previousFull;
              const percentChange = client.previousFull !== 0 ? diff / client.previousFull : 0;
              
              return (
                <TableRow key={client.name} className="h-[57px]">
                  <TableCell className="text-center text-gray-500 text-[10px]">{index + 1}</TableCell>
                  <TableCell>
                    {client.slug ? (
                      <Link href={`/about-us/clients/${client.slug}`} className="text-blue-600 hover:underline">
                        {client.name}
                      </Link>
                    ) : (
                      <span>{client.name}</span>
                    )}
                  </TableCell>
                  <TableCell className={`text-right border-x ${client.previousPartial === 0 ? 'text-gray-300' : ''}`}>
                    {formatCurrency(client.previousPartial)}
                  </TableCell>
                  <TableCell className={`text-right border-r ${client.previousFull === 0 ? 'text-gray-300' : ''}`}>
                    {formatCurrency(client.previousFull)}
                  </TableCell>
                  <TableCell className={`text-right ${client.current === 0 ? 'text-gray-300' : ''}`}>
                    {formatCurrency(client.current)}
                  </TableCell>
                  <TableCell className="text-right relative">
                    {formatCurrency(diff)}
                    {diff !== 0 && (
                      <div className={`absolute bottom-1 right-2 text-[10px] ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'percent',
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        }).format(percentChange)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-bold border-t-2 h-[57px]">
              <TableCell></TableCell>
              <TableCell>Total</TableCell>
              <TableCell className="text-right border-x">{formatCurrency(total.previousPartial)}</TableCell>
              <TableCell className="text-right border-r">{formatCurrency(total.previousFull)}</TableCell>
              <TableCell className="text-right">{formatCurrency(total.current)}</TableCell>
              <TableCell className="text-right relative">
                {formatCurrency(total.current - total.previousFull)}
                {total.previousFull !== 0 && (
                  <div className={`absolute bottom-1 right-2 text-[10px] ${total.current > total.previousFull ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'percent',
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    }).format((total.current - total.previousFull) / total.previousFull)}
                  </div>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
      </div>

      <div className="ml-2 mr-2">
        {renderTable('Consulting', consultingClients, 'consulting')}
        {renderTable('Consulting Pre', consultingPreClients, 'consultingPre')}
        {renderTable('Hands On', handsOnClients, 'handsOn')}
        {renderTable('Squad', squadClients, 'squad')}
      </div>
    </div>
  );
}
