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

const SummaryCard = ({ title, items }: SummaryCardProps) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">{title}</TableHead>
            <TableHead className="text-right">Regular</TableHead>
            <TableHead className="text-right">Pre-contracted</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.regular)}
              </TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.preContracted)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

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