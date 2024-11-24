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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <div className="ml-2 mr-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>Client</TableHead>
              <TableHead colSpan={3} className="text-center border-l">Previous</TableHead>
              <TableHead colSpan={3} className="text-center border-l">Current</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="text-right w-[120px] relative border-l">Regular</TableHead>
              <TableHead className="text-right w-[120px] relative">Pre</TableHead>
              <TableHead className="text-right w-[120px] relative">Total</TableHead>
              <TableHead className="text-right w-[120px] relative border-l">Regular</TableHead>
              <TableHead className="text-right w-[120px] relative">Pre</TableHead>
              <TableHead className="text-right w-[120px] relative">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(clients.values()).map((client: any) => (
              <TableRow key={client.name}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px] border-l">{formatCurrency(client.previous.regular)}</TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px]">
                  {formatCurrency(client.previous.preContracted)}
                </TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px]">{formatCurrency(client.previous.total)}</TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px] border-l">{formatCurrency(client.current.regular)}</TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px]">
                  {formatCurrency(client.current.preContracted)}
                </TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px]">{formatCurrency(client.current.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
