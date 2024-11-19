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
          {data.performanceAnalysis.weeks[selectedWeekIndex].accountManagers.map((manager: any) => (
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
              {expandedPreContractedManagers.has(manager.name) && manager.clients.map((client: any) => (
                <React.Fragment key={`${manager.name}-${client.name}`}>
                  <TableRow 
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleClient(client.name)}
                  >
                    <TableCell className="pl-8 text-sm text-gray-600 flex items-center gap-2">
                      {expandedClients.has(client.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                  {expandedClients.has(client.name) && client.sponsors.map((sponsor: any) => (
                    <React.Fragment key={`${manager.name}-${client.name}-${sponsor.name}`}>
                      <TableRow 
                        className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                        onClick={() => toggleSponsor(sponsor.name)}
                      >
                        <TableCell className="pl-12 text-sm text-gray-500 flex items-center gap-2">
                          {expandedSponsors.has(sponsor.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                      {expandedSponsors.has(sponsor.name) && (
                        <TableRow key={`${manager.name}-${client.name}-${sponsor.name}-cases`}>
                          <TableCell className="pl-16 text-sm text-gray-500">
                            {sponsor.preContractedCases.map((c: any) => (
                              <div key={c.title}>{c.title}</div>
                            ))}
                          </TableCell>
                          {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                            const weekManager = week.accountManagers.find((m: any) => m.name === manager.name);
                            const weekClient = weekManager?.clients.find((c: any) => c.name === client.name);
                            const weekSponsor = weekClient?.sponsors.find((s: any) => s.name === sponsor.name);
                            const cases = weekSponsor?.preContractedCases || [];
                            
                            return (
                              <TableCell key={week.start} className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                                {cases.map((c: any) => (
                                  <div key={c.title}>
                                    <div>{formatHours(c.actualWorkHours)} / {formatHours(c.approvedWorkHours)}</div>
                                    {c.possibleUnpaidHours > 0 && (
                                      <div className="text-orange-500 text-sm">
                                        {formatHours(c.possibleUnpaidHours)} unpaid
                                      </div>
                                    )}
                                    {c.possibleIdleHours > 0 && (
                                      <div className="text-yellow-500 text-sm">
                                        {formatHours(c.possibleIdleHours)} idle
                                      </div>
                                    )}
                                    {c.inContextActualWorkHours !== c.actualWorkHours && c.inContextActualWorkHours > 0 && (
                                      <div className="text-blue-500 text-sm">
                                        {formatHours(c.inContextActualWorkHours)} this month
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      )}
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