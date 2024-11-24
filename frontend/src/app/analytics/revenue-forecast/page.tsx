"use client";

import { useQuery } from "@apollo/client";
import { format, endOfMonth, subMonths } from "date-fns";
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

export default function RevenueForecastPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'current.total', direction: 'desc' });

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const previousMonthDate = endOfMonth(subMonths(date, 1));

  const { loading, error, data } = useQuery(REVENUE_FORECAST_QUERY, {
    variables: {
      inAnalysisDate: format(date, "yyyy-MM-dd"),
      previousMonthDate: format(previousMonthDate, "yyyy-MM-dd"),
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Merge client data from both queries
  const clients = new Map();

  data.previous_month.summaries.byClient.forEach((client: any) => {
    clients.set(client.slug, {
      name: client.name,
      previous: {
        regular: client.regular,
        preContracted: client.preContracted,
        total: client.total,
      },
      current: {
        regular: 0,
        preContracted: 0,
        total: 0,
      },
    });
  });

  data.in_analysis.summaries.byClient.forEach((client: any) => {
    if (clients.has(client.slug)) {
      const existingClient = clients.get(client.slug);
      existingClient.current = {
        regular: client.regular,
        preContracted: client.preContracted,
        total: client.total,
      };
    } else {
      clients.set(client.slug, {
        name: client.name,
        previous: {
          regular: 0,
          preContracted: 0,
          total: 0,
        },
        current: {
          regular: client.regular,
          preContracted: client.preContracted,
          total: client.total,
        },
      });
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate totals
  const totals = Array.from(clients.values()).reduce((acc, client) => ({
    previous: {
      regular: acc.previous.regular + client.previous.regular,
      preContracted: acc.previous.preContracted + client.previous.preContracted,
      total: acc.previous.total + client.previous.total,
    },
    current: {
      regular: acc.current.regular + client.current.regular,
      preContracted: acc.current.preContracted + client.current.preContracted,
      total: acc.current.total + client.current.total,
    }
  }), {
    previous: { regular: 0, preContracted: 0, total: 0 },
    current: { regular: 0, preContracted: 0, total: 0 }
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedClients = () => {
    const clientsArray = Array.from(clients.values());
    if (!sortConfig.key) return clientsArray;

    return clientsArray.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      // Extract values based on sort key
      if (sortConfig.key.includes('.')) {
        const [period, type] = sortConfig.key.split('.');
        if (period === 'diff') {
          aValue = a.current[type] - a.previous[type];
          bValue = b.current[type] - b.previous[type];
        } else {
          aValue = a[period][type];
          bValue = b[period][type];
        }
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedClients = getSortedClients();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <div className="ml-2 mr-2">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead rowSpan={2}>Client</TableHead>
              <TableHead colSpan={3} className="text-center border-l border-gray-300">{format(previousMonthDate, 'MMMM yyyy')}</TableHead>
              <TableHead colSpan={3} className="text-center border-l border-gray-300">{format(date, "MMMM yyyy 'until' EEEE, dd")}</TableHead>
              <TableHead colSpan={3} className="text-center border-l border-gray-300">Difference</TableHead>
            </TableRow>
            <TableRow>
              <TableHead onClick={() => requestSort('previous.regular')} className="text-right w-[100px] relative border-l border-gray-300 cursor-pointer hover:bg-gray-100">Regular {sortConfig.key === 'previous.regular' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('previous.preContracted')} className="text-right w-[100px] relative border-l border-gray-100 cursor-pointer hover:bg-gray-100">Pre {sortConfig.key === 'previous.preContracted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('previous.total')} className="text-right w-[100px] relative font-bold border-l border-gray-100 cursor-pointer hover:bg-gray-100">Total {sortConfig.key === 'previous.total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('current.regular')} className="text-right w-[100px] relative border-l border-gray-300 cursor-pointer hover:bg-gray-100">Regular {sortConfig.key === 'current.regular' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('current.preContracted')} className="text-right w-[100px] relative border-l border-gray-100 cursor-pointer hover:bg-gray-100">Pre {sortConfig.key === 'current.preContracted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('current.total')} className="text-right w-[100px] relative font-bold border-l border-gray-100 cursor-pointer hover:bg-gray-100">Total {sortConfig.key === 'current.total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('diff.regular')} className="text-right w-[100px] relative border-l border-gray-300 cursor-pointer hover:bg-gray-100">Regular {sortConfig.key === 'diff.regular' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('diff.preContracted')} className="text-right w-[100px] relative border-l border-gray-100 cursor-pointer hover:bg-gray-100">Pre {sortConfig.key === 'diff.preContracted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
              <TableHead onClick={() => requestSort('diff.total')} className="text-right w-[100px] relative font-bold border-l border-gray-100 cursor-pointer hover:bg-gray-100">Total {sortConfig.key === 'diff.total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client: any) => (
              <TableRow key={client.name}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-300 text-sm">{formatCurrency(client.previous.regular)}</TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-100 text-sm">
                  {formatCurrency(client.previous.preContracted)}
                </TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] font-bold border-l border-gray-100 text-sm">{formatCurrency(client.previous.total)}</TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-300 text-sm">{formatCurrency(client.current.regular)}</TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-100 text-sm">
                  {formatCurrency(client.current.preContracted)}
                </TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] font-bold border-l border-gray-100 text-sm">{formatCurrency(client.current.total)}</TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-300 text-sm">{formatCurrency(client.current.regular - client.previous.regular)}</TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-100 text-sm">
                  {formatCurrency(client.current.preContracted - client.previous.preContracted)}
                </TableCell>
                <TableCell className="text-right w-[100px] relative h-[57px] font-bold border-l border-gray-100 text-sm">{formatCurrency(client.current.total - client.previous.total)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold border-t-2">
              <TableCell>Total</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-300 text-sm">{formatCurrency(totals.previous.regular)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-100 text-sm">{formatCurrency(totals.previous.preContracted)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] font-bold border-l border-gray-100 text-sm">{formatCurrency(totals.previous.total)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-300 text-sm">{formatCurrency(totals.current.regular)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-100 text-sm">{formatCurrency(totals.current.preContracted)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] font-bold border-l border-gray-100 text-sm">{formatCurrency(totals.current.total)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-300 text-sm">{formatCurrency(totals.current.regular - totals.previous.regular)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] border-l border-gray-100 text-sm">{formatCurrency(totals.current.preContracted - totals.previous.preContracted)}</TableCell>
              <TableCell className="text-right w-[100px] relative h-[57px] font-bold border-l border-gray-100 text-sm">{formatCurrency(totals.current.total - totals.previous.total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
