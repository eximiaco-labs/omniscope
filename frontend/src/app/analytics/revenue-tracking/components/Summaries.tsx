import { format } from "date-fns";
import { RevenueTrackingQuery } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import { useState } from "react";

interface SummariesProps {
  data: RevenueTrackingQuery;
  date: Date;
}

interface SummaryCardProps {
  title: string;
  items: {
    name: string;
    regular: number;
    preContracted: number;
    total: number;
  }[];
}

const SummaryCard = ({ title, items }: SummaryCardProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof items[0] | null;
    direction: 'asc' | 'desc';
  }>({ key: 'total', direction: 'desc' });

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof typeof items[0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(value);
  };

  const formatPercent = (value: number, total: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / total);
  };

  const totals = items.reduce((acc, item) => ({
    regular: acc.regular + item.regular,
    preContracted: acc.preContracted + item.preContracted,
    total: acc.total + item.total
  }), { regular: 0, preContracted: 0, total: 0 });

  return (
    <div className="bg-white p-4">
      <SectionHeader title={title} subtitle="" />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead 
                className="text-left cursor-pointer hover:bg-gray-50"
                onClick={() => requestSort('name')}
              >
                {title.replace('By ', '')} {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 w-[120px]"
                onClick={() => requestSort('regular')}
              >
                Regular {sortConfig.key === 'regular' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 w-[120px]"
                onClick={() => requestSort('preContracted')}
              >
                Pre {sortConfig.key === 'preContracted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 w-[120px]"
                onClick={() => requestSort('total')}
              >
                Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-center text-gray-500 text-[10px] h-[57px]">{index + 1}</TableCell>
                <TableCell className="h-[57px]">{item.name}</TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px]">
                  {formatNumber(item.regular)}
                  <div className="absolute bottom-1 right-2 text-[10px] text-gray-500">
                    {formatPercent(item.regular, totals.regular)}
                  </div>
                </TableCell>
                <TableCell className="text-right w-[120px] relative h-[57px]">
                  {formatNumber(item.preContracted)}
                  <div className="absolute bottom-1 right-2 text-[10px] text-gray-500">
                    {formatPercent(item.preContracted, totals.preContracted)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold w-[120px] relative h-[57px]">
                  {formatNumber(item.total)}
                  <div className="absolute bottom-1 right-2 text-[10px] text-gray-500">
                    {formatPercent(item.total, totals.total)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold border-t-2">
              <TableCell></TableCell>
              <TableCell>Total</TableCell>
              <TableCell className="text-right w-[120px]">
                {formatNumber(totals.regular)}
              </TableCell>
              <TableCell className="text-right w-[120px]">
                {formatNumber(totals.preContracted)}
              </TableCell>
              <TableCell className="text-right w-[120px]">
                {formatNumber(totals.total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export function Summaries({ data, date }: SummariesProps) {
  const summaries = data.revenueTracking.summaries;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={format(date, "MMMM yyyy 'Summary'")}
        subtitle={format(date, "'until' EEEE, dd")}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard 
          title="By Type" 
          items={summaries.byKind}
        />
        
        <SummaryCard 
          title="By Account Manager" 
          items={summaries.byAccountManager}
        />
        
        <SummaryCard 
          title="By Client" 
          items={summaries.byClient}
        />
        
        <SummaryCard 
          title="By Sponsor" 
          items={summaries.bySponsor}
        />
      </div>
    </div>
  );
}