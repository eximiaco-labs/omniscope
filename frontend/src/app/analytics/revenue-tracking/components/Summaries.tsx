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

  return (
    <div className="bg-white p-4">
      <SectionHeader title={title} subtitle="" />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right w-[120px]">
                  {formatNumber(item.regular)}
                </TableCell>
                <TableCell className="text-right w-[120px]">
                  {formatNumber(item.preContracted)}
                </TableCell>
                <TableCell className="text-right font-semibold w-[120px]">
                  {formatNumber(item.total)}
                </TableCell>
              </TableRow>
            ))}
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