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
  // Helper function to check if client has any non-zero hours
  const hasNonZeroHours = (client: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const weekClient = week.clients.find((c: any) => c.name === client.name);
      const totals = weekClient?.totals?.preContracted;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if sponsor has any non-zero hours
  const hasNonZeroSponsorHours = (client: any, sponsor: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const weekClient = week.clients.find((c: any) => c.name === client.name);
      const weekSponsor = weekClient?.sponsors.find((s: any) => s.name === sponsor.name);
      const totals = weekSponsor?.totals?.preContracted;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  return (
    <div>
      <SectionHeader title="Pre-Contracted Cases by Client" subtitle="" />
      <Table className="ml-2 mr-2">
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => (
              <TableHead 
                key={week.start} 
                className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
              >
                {format(new Date(week.start), "MMM d")} - {format(new Date(week.end), "d")}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.performanceAnalysis.weeks[selectedWeekIndex].clients
            .filter(hasNonZeroHours)
            .map((client: any) => (
            <React.Fragment key={client.name}>
              <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleClient(client.name)}>
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedClients.has(client.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {client.name}
                </TableCell>
                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                  const weekClient = week.clients.find((c: any) => c.name === client.name);
                  const totals = weekClient?.totals?.preContracted;
                  
                  return (
                    <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                      {totals ? (
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
                      ) : "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
              {expandedClients.has(client.name) && data.performanceAnalysis.weeks[selectedWeekIndex].clients
                .find((c: any) => c.name === client.name)
                ?.sponsors
                .filter((sponsor: any) => hasNonZeroSponsorHours(client, sponsor))
                .map((sponsor: any) => (
                <React.Fragment key={`${client.name}-${sponsor.name}`}>
                  <TableRow 
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                    onClick={() => toggleSponsor(sponsor.name)}
                  >
                    <TableCell className="pl-8 text-sm text-gray-500 flex items-center gap-2">
                      {expandedSponsors.has(sponsor.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {sponsor.name}
                    </TableCell>
                    {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                      const weekClient = week.clients.find((c: any) => c.name === client.name);
                      const weekSponsor = weekClient?.sponsors.find((s: any) => s.name === sponsor.name);
                      const totals = weekSponsor?.totals?.preContracted;

                      return (
                        <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                          {totals ? (
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
                          ) : "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {expandedSponsors.has(sponsor.name) && data.performanceAnalysis.weeks[selectedWeekIndex].clients
                    .find((c: any) => c.name === client.name)
                    ?.sponsors.find((s: any) => s.name === sponsor.name)
                    ?.preContractedCases
                    .map((preContractedCase: any) => (
                    <TableRow key={`${client.name}-${sponsor.name}-${preContractedCase.title}`}>
                      <TableCell className="pl-16 text-sm text-gray-500">
                        {preContractedCase.title}
                      </TableCell>
                      {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                        const weekClient = week.clients.find((c: any) => c.name === client.name);
                        const weekSponsor = weekClient?.sponsors.find((s: any) => s.name === sponsor.name);
                        const weekCase = weekSponsor?.preContractedCases
                          .find((c: any) => c.title === preContractedCase.title);
                        
                        return (
                          <TableCell key={week.start} className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                            {weekCase && (
                              <div>
                                <div>{formatHours(weekCase.actualWorkHours)} / {formatHours(weekCase.approvedWorkHours)}</div>
                                {weekCase.possibleUnpaidHours > 0 && (
                                  <div className="text-orange-500 text-sm">
                                    {formatHours(weekCase.possibleUnpaidHours)} unpaid
                                  </div>
                                )}
                                {weekCase.possibleIdleHours > 0 && (
                                  <div className="text-yellow-500 text-sm">
                                    {formatHours(weekCase.possibleIdleHours)} idle
                                  </div>
                                )}
                                {weekCase.inContextActualWorkHours !== weekCase.actualWorkHours && weekCase.inContextActualWorkHours > 0 && (
                                  <div className="text-blue-500 text-sm">
                                    {formatHours(weekCase.inContextActualWorkHours)} this month
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
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