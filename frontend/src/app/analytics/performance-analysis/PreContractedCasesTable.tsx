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
  // Helper function to check if manager has any non-zero hours
  const hasNonZeroHours = (manager: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const managerData = week.accountManagers.find((m: any) => m.name === manager.name);
      const totals = managerData?.totals?.preContracted;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if client has any non-zero hours
  const hasNonZeroClientHours = (manager: string, client: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const managerData = week.accountManagers.find((m: any) => m.name === manager);
      const clientData = managerData?.clients.find((c: any) => c.name === client.name);
      const totals = clientData?.totals?.preContracted;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if sponsor has any non-zero hours
  const hasNonZeroSponsorHours = (manager: string, client: string, sponsor: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const managerData = week.accountManagers.find((m: any) => m.name === manager);
      const clientData = managerData?.clients.find((c: any) => c.name === client);
      const sponsorData = clientData?.sponsors.find((s: any) => s.name === sponsor.name);
      const totals = sponsorData?.totals?.preContracted;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if case has any non-zero hours
  const hasNonZeroCaseHours = (preContractedCase: any) => {
    return preContractedCase.actualWorkHours > 0 || preContractedCase.approvedWorkHours > 0;
  };

  return (
    <div>
      <SectionHeader title="Pre-Contracted Cases by Account Manager" subtitle="" />
      <Table className="ml-2 mr-2">
        <TableHeader>
          <TableRow>
            <TableHead>Account Manager</TableHead>
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
          {data.performanceAnalysis.weeks[0].accountManagers
            .filter((manager: any) => hasNonZeroHours(manager))
            .map((manager: any) => (
            <React.Fragment key={manager.name}>
              <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => togglePreContractedManager(manager.name)}>
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedPreContractedManagers.has(manager.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {manager.name}
                </TableCell>
                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                  const weekManager = week.accountManagers.find((m: any) => m.name === manager.name);
                  const totals = weekManager?.totals?.preContracted || {};
                  
                  return (
                    <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                      {weekManager ? (
                        <div>
                          <div>{formatHours(totals.actualWorkHours || 0)} / {formatHours(totals.approvedWorkHours || 0)}</div>
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
              {expandedPreContractedManagers.has(manager.name) && data.performanceAnalysis.weeks[0].accountManagers
                .find((m: any) => m.name === manager.name)
                ?.clients
                .filter((client: any) => hasNonZeroClientHours(manager.name, client))
                .map((client: any) => (
                <React.Fragment key={`${manager.name}-${client.name}`}>
                  <TableRow 
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleClient(`precontracted-${manager.name}-${client.name}`)}
                  >
                    <TableCell className="pl-8 text-sm text-gray-600 flex items-center gap-2">
                      {expandedClients.has(`precontracted-${manager.name}-${client.name}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {client.name}
                    </TableCell>
                    {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                      const weekManager = week.accountManagers.find((m: any) => m.name === manager.name);
                      const weekClient = weekManager?.clients.find((c: any) => c.name === client.name);
                      const totals = weekClient?.totals?.preContracted || {};
                      
                      return (
                        <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                          {weekClient ? (
                            <div>
                              <div>{formatHours(totals.actualWorkHours || 0)} / {formatHours(totals.approvedWorkHours || 0)}</div>
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
                  {expandedClients.has(`precontracted-${manager.name}-${client.name}`) && data.performanceAnalysis.weeks[0].accountManagers
                    .find((m: any) => m.name === manager.name)
                    ?.clients.find((c: any) => c.name === client.name)
                    ?.sponsors
                    .filter((sponsor: any) => hasNonZeroSponsorHours(manager.name, client.name, sponsor))
                    .map((sponsor: any) => (
                    <React.Fragment key={`${manager.name}-${client.name}-${sponsor.name}`}>
                      <TableRow 
                        className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                        onClick={() => toggleSponsor(`precontracted-${manager.name}-${client.name}-${sponsor.name}`)}
                      >
                        <TableCell className="pl-12 text-sm text-gray-500 flex items-center gap-2">
                          {expandedSponsors.has(`precontracted-${manager.name}-${client.name}-${sponsor.name}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {sponsor.name}
                        </TableCell>
                        {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                          const weekManager = week.accountManagers.find((m: any) => m.name === manager.name);
                          const weekClient = weekManager?.clients.find((c: any) => c.name === client.name);
                          const weekSponsor = weekClient?.sponsors.find((s: any) => s.name === sponsor.name);
                          const totals = weekSponsor?.totals?.preContracted || {};
                          
                          return (
                            <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                              {weekSponsor ? (
                                <div>
                                  <div>{formatHours(totals.actualWorkHours || 0)} / {formatHours(totals.approvedWorkHours || 0)}</div>
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
                      {expandedSponsors.has(`precontracted-${manager.name}-${client.name}-${sponsor.name}`) && data.performanceAnalysis.weeks[0].accountManagers
                        .find((m: any) => m.name === manager.name)
                        ?.clients.find((c: any) => c.name === client.name)
                        ?.sponsors.find((s: any) => s.name === sponsor.name)
                        ?.preContractedCases
                        .filter(hasNonZeroCaseHours)
                        .map((preContractedCase: any) => (
                          <TableRow key={`${manager.name}-${client.name}-${sponsor.name}-${preContractedCase.title}`}>
                            <TableCell className="pl-16 text-sm text-gray-500">
                              {preContractedCase.title}
                            </TableCell>
                            {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                              const weekManager = week.accountManagers.find((m: any) => m.name === manager.name);
                              const weekClient = weekManager?.clients.find((c2: any) => c2.name === client.name);
                              const weekSponsor = weekClient?.sponsors.find((s: any) => s.name === sponsor.name);
                              const weekCase = weekSponsor?.preContractedCases?.find((c2: any) => c2.title === preContractedCase.title);
                              
                              return (
                                <TableCell key={week.start} className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                                  {weekCase ? (
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
                                  ) : "-"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                    </React.Fragment>
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