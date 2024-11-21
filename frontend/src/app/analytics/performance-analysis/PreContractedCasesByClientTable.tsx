import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";

interface PreContractedCasesByClientTableProps {
  data: any;
  expandedClients: Set<string>;
  expandedSponsors: Set<string>;
  selectedWeekIndex: number;
  toggleClient: (clientKey: string) => void;
  toggleSponsor: (sponsorKey: string) => void;
  formatHours: (hours: number) => string;
}

export function PreContractedCasesByClientTable({
  data,
  expandedClients,
  expandedSponsors,
  selectedWeekIndex,
  toggleClient,
  toggleSponsor,
  formatHours,
}: PreContractedCasesByClientTableProps) {
  const pivotedData = data.performanceAnalysis.pivoted.preContracted;

  const renderTotals = (totals: any) => {
    if (!totals) return "-";
    return (
      <div>
        <div>{formatHours(totals.actualWorkHours)} / {formatHours(totals.approvedWorkHours)}</div>
        {totals.possibleUnpaidHours > 0 && (
          <div className="text-orange-500 text-sm">
            {formatHours(totals.possibleUnpaidHours)} unpaid
          </div>
        )}
        {totals.possibleIdleHours > 0 && (
          <div className="text-yellow-500 text-sm">
            {formatHours(totals.possibleIdleHours)} idle
          </div>
        )}
        {totals.inContextActualWorkHours !== totals.actualWorkHours && totals.inContextActualWorkHours > 0 && (
          <div className="text-blue-500 text-sm">
            {formatHours(totals.inContextActualWorkHours)} this month
          </div>
        )}
      </div>
    );
  };

  // Get all unique clients across account managers and sort them
  const allClients = pivotedData.byAccountManager
    .flatMap((manager: { byClient: any; }) => manager.byClient)
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Remove duplicates by client name
  const uniqueClients = allClients.filter((client: any, index: number, self: any[]) =>
    index === self.findIndex((c: any) => c.name === client.name)
  );

  const getPastColumnDates = () => {
    const firstWeek = pivotedData.byAccountManager[0]?.weeks[0];
    const lastWeek = pivotedData.byAccountManager[0]?.weeks[selectedWeekIndex - 1];
    
    if (!firstWeek || !lastWeek) return "Past";
    
    return `${format(new Date(firstWeek.start), "MMM d")} - ${format(new Date(lastWeek.end), "MMM d")}`;
  };

  return (
    <div>
      <SectionHeader title="Pre-Contracted Cases by Client" subtitle="" />
      <Table className="ml-2 mr-2">
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="w-[150px] bg-yellow-50">{getPastColumnDates()}</TableHead>
            {pivotedData.byAccountManager[0]?.weeks.map((week: any, weekIndex: number) => {
              const endDate = new Date(week.end);
              endDate.setDate(endDate.getDate() - 1);
              return (
                <TableHead 
                  key={week.start} 
                  className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                >
                  {format(new Date(week.start), "MMM d")} - {format(endDate, "d")}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueClients.map((client: any) => (
            <React.Fragment key={client.name}>
              <TableRow 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleClient(client.name)}
              >
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedClients.has(client.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {client.name}
                </TableCell>
                <TableCell className="w-[150px] bg-yellow-50">
                  {renderTotals(client.past)}
                </TableCell>
                {client.weeks.map((week: any, weekIndex: number) => (
                  <TableCell 
                    key={week.start}
                    className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                  >
                    {renderTotals(week.totals)}
                  </TableCell>
                ))}
              </TableRow>

              {expandedClients.has(client.name) && client.bySponsor.map((sponsor: any) => (
                <React.Fragment key={`${client.name}-${sponsor.name}`}>
                  <TableRow 
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                    onClick={() => toggleSponsor(sponsor.name)}
                  >
                    <TableCell className="pl-8 text-sm text-gray-500 flex items-center gap-2">
                      {expandedSponsors.has(sponsor.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {sponsor.name}
                    </TableCell>
                    <TableCell className="w-[150px] bg-yellow-50">
                      {renderTotals(sponsor.past)}
                    </TableCell>
                    {sponsor.weeks.map((week: any, weekIndex: number) => (
                      <TableCell 
                        key={week.start}
                        className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                      >
                        {renderTotals(week.totals)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {expandedSponsors.has(sponsor.name) && sponsor.byCase.map((preContractedCase: any) => (
                    <TableRow key={`${client.name}-${sponsor.name}-${preContractedCase.title}`}>
                      <TableCell className="pl-16 text-sm text-gray-500">
                        {preContractedCase.title}
                      </TableCell>
                      <TableCell className="w-[150px] bg-yellow-50">
                        {renderTotals(preContractedCase.past)}
                      </TableCell>
                      {preContractedCase.weeks.map((week: any, weekIndex: number) => (
                        <TableCell 
                          key={week.start}
                          className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                        >
                          {renderTotals(week.totals)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}