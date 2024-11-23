"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { REVENUE_TRACKING_QUERY } from "./query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAT_COLORS } from "@/app/constants/colors";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

export default function RevenuePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(REVENUE_TRACKING_QUERY, {
    variables: { date: format(date, "yyyy-MM-dd") }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <div className="ml-2 mr-2">
        <SectionHeader title="Fixed Fee Revenue Tracking" subtitle={format(date, "MMMM / yyyy")} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client / Case</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.revenueTracking.fixed.monthly.byClient.map((client: any) => (
              <>
                <TableRow 
                  key={client.name}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleClient(client.name)}
                >
                  <TableCell className="text-sm text-gray-600 flex items-center gap-2">
                    {expandedClients.has(client.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {client.name}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">{formatCurrency(client.fee)}</TableCell>
                </TableRow>

                {expandedClients.has(client.name) && client.byCase.map((caseItem: any) => (
                  <TableRow key={`${client.name}-${caseItem.title}`} className="bg-gray-50">
                    <TableCell className="pl-8 text-sm text-gray-600">
                      {caseItem.title}
                    </TableCell>
                    <TableCell>
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          {caseItem.byProject.map((project: any) => {
                            const textColor = STAT_COLORS[project.kind as keyof typeof STAT_COLORS];
                            
                            return (
                              <tr key={project.name} className="border-b border-gray-200">
                                <td className="pr-2 w-[250px] break-words border-r border-gray-200">
                                  <div style={{ color: textColor }}>
                                    {project.name}
                                  </div>
                                </td>
                                <td className="text-gray-600 pl-2 w-[100px]">{project.kind}</td>
                                <td className="text-gray-600 pl-2 text-right">{formatCurrency(project.fee)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(caseItem.fee)}</TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            <TableRow className="font-bold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.revenueTracking.fixed.monthly.total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
