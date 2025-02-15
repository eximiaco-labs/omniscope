import { useState } from "react";
import { format } from "date-fns";
import SectionHeader from "@/components/SectionHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ArrowDownIcon } from "lucide-react";

interface RegularCasesCTAProps {
  data: any;
  selectedWeekIndex: number;
  formatHours: (hours: number) => string;
}

export function RegularCasesCTA({ data, selectedWeekIndex, formatHours }: RegularCasesCTAProps) {
  const [sortColumn, setSortColumn] = useState<'wastedHours' | 'overApprovedHours'>('wastedHours');

  const handleSort = (column: 'wastedHours' | 'overApprovedHours') => {
    setSortColumn(column);
  };

  const filteredAndSortedClients = data.performanceAnalysis.pivoted.regular.byAccountManager
    .flatMap((manager: any) => 
      manager.byClient.map((client: any) => ({
        ...client,
        accountManager: manager.name
      }))
    )
    // Remove duplicates by client name and account manager
    .filter((client: any, index: number, self: any[]) =>
      index === self.findIndex((c: any) => 
        c.name === client.name && c.accountManager === client.accountManager
      )
    )
    // Only include clients with wasted or over hours
    .filter((client: any) => 
      (client.past?.wastedHours > 0 || client.past?.overApprovedHours > 0)
    )
    // Sort by selected column
    .sort((a: any, b: any) => 
      (b.past?.[sortColumn] || 0) - (a.past?.[sortColumn] || 0)
    );

  const totals = filteredAndSortedClients.reduce((acc: any, client: any) => ({
    wastedHours: acc.wastedHours + (client.past?.wastedHours || 0),
    overApprovedHours: acc.overApprovedHours + (client.past?.overApprovedHours || 0)
  }), { wastedHours: 0, overApprovedHours: 0 });

  const firstWeek = data.performanceAnalysis.pivoted.regular.byAccountManager[0]?.weeks[0];
  const lastWeek = data.performanceAnalysis.pivoted.regular.byAccountManager[0]?.weeks[selectedWeekIndex - 1];

  return (
    <div>
      <SectionHeader 
        title="Regular hours analysis by client" 
        subtitle={`${format(new Date(firstWeek?.start), "MMM dd")} - ${format(new Date(lastWeek?.end), "MMM dd")}`}
      />
      <Table className="ml-2 mr-2">
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Account Manager</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 w-[150px]"
              onClick={() => handleSort('wastedHours')}
            >
              <div className="flex items-center gap-2">
                Wasted Hours
                {sortColumn === 'wastedHours' && <ArrowDownIcon size={16} />}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 w-[150px]"
              onClick={() => handleSort('overApprovedHours')}
            >
              <div className="flex items-center gap-2">
                Over Hours
                {sortColumn === 'overApprovedHours' && <ArrowDownIcon size={16} />}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedClients.map((client: any, index: number) => (
            <TableRow 
              key={`${client.name}-${client.accountManager}`}
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.accountManager}</TableCell>
              <TableCell className="w-[150px]">{formatHours(client.past?.wastedHours || 0)}</TableCell>
              <TableCell className="w-[150px]">{formatHours(client.past?.overApprovedHours || 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gray-100 font-medium">
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="w-[150px]">{formatHours(totals.wastedHours)}</TableCell>
            <TableCell className="w-[150px]">{formatHours(totals.overApprovedHours)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
} 