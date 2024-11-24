import { format } from "date-fns";
import { RevenueTrackingQuery } from "../types";
import { Table } from "@/components/ui/table";

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
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">{title}</th>
            <th className="text-right py-2">Regular</th>
            <th className="text-right py-2">Pre-contracted</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="py-2">{item.name}</td>
              <td className="text-right py-2">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.regular)}
              </td>
              <td className="text-right py-2">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.preContracted)}
              </td>
              <td className="text-right py-2 font-semibold">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
);

export function Summaries({ data, date }: SummariesProps) {
  const summaries = data.revenueTracking.summaries;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">
        Summary - {format(date, "MMMM yyyy")}
      </h2>
      
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