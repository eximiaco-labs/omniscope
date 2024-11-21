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

interface PreContractedCasesTableProps {
  data: any;
  expandedPreContractedManagers: Set<string>;
  expandedClients: Set<string>;
  expandedSponsors: Set<string>;
  selectedWeekIndex: number;
  togglePreContractedManager: (manager: string) => void;
  toggleClient: (clientKey: string) => void;
  toggleSponsor: (sponsorKey: string) => void;
  formatHours: (hours: number) => string;
}

export function PreContractedCasesTable({
  data,
  expandedPreContractedManagers,
  expandedClients,
  expandedSponsors,
  selectedWeekIndex,
  togglePreContractedManager,
  toggleClient,
  toggleSponsor,
  formatHours,
}: PreContractedCasesTableProps) {
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

  return (
    <div>
      <SectionHeader title="Pre-Contracted Cases by Account Manager" subtitle="" />
      <Table className="ml-2 mr-2">
        <TableHeader>
          <TableRow>
            <TableHead>Account Manager</TableHead>
            <TableHead className="w-[150px]">Past</TableHead>
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
          {pivotedData.byAccountManager.map((manager: any) => (
            <>
              <TableRow 
                key={manager.name}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => togglePreContractedManager(manager.name)}
              >
                <TableCell className="text-sm text-gray-600 flex items-center gap-2">
                  {expandedPreContractedManagers.has(manager.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {manager.name}
                </TableCell>
                <TableCell className="w-[150px]">
                  {renderTotals(manager.past)}
                </TableCell>
                {manager.weeks.map((week: any, weekIndex: number) => (
                  <TableCell 
                    key={week.start}
                    className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                  >
                    {renderTotals(week.totals)}
                  </TableCell>
                ))}
              </TableRow>

              {expandedPreContractedManagers.has(manager.name) && manager.byClient.map((client: any) => (
                <>
                  <TableRow 
                    key={`${manager.name}-${client.name}`}
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleClient(`precontracted-${manager.name}-${client.name}`)}
                  >
                    <TableCell className="pl-8 text-sm text-gray-600 flex items-center gap-2">
                      {expandedClients.has(`precontracted-${manager.name}-${client.name}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {client.name}
                    </TableCell>
                    <TableCell className="w-[150px]">
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

                  {expandedClients.has(`precontracted-${manager.name}-${client.name}`) && client.bySponsor.map((sponsor: any) => (
                    <>
                      <TableRow 
                        key={`${manager.name}-${client.name}-${sponsor.name}`}
                        className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                        onClick={() => toggleSponsor(`precontracted-${manager.name}-${client.name}-${sponsor.name}`)}
                      >
                        <TableCell className="pl-12 text-sm text-gray-600 flex items-center gap-2">
                          {expandedSponsors.has(`precontracted-${manager.name}-${client.name}-${sponsor.name}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {sponsor.name}
                        </TableCell>
                        <TableCell className="w-[150px]">
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

                      {expandedSponsors.has(`precontracted-${manager.name}-${client.name}-${sponsor.name}`) && sponsor.byCase.map((preContractedCase: any) => (
                        <TableRow 
                          key={`${manager.name}-${client.name}-${sponsor.name}-${preContractedCase.title}`}
                          className="bg-gray-200"
                        >
                          <TableCell className="pl-16 text-sm text-gray-600">
                            {preContractedCase.title}
                          </TableCell>
                          <TableCell className="w-[150px]">
                            {renderTotals(preContractedCase.past)}
                          </TableCell>
                          {preContractedCase.weeks.map((week: any, weekIndex: number) => (
                            <TableCell 
                              key={week.start}
                              className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                            >
                              {renderTotals(week.totals)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ))}
                </>
              ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}