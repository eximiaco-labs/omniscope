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
  clients: string[];
  expandedClients: Set<string>;
  expandedSponsors: Set<string>;
  selectedWeekIndex: number;
  toggleClient: (clientKey: string) => void;
  toggleSponsor: (sponsorKey: string) => void;
  getSponsorsForClient: (week: any, clientName: string, isRegular: boolean) => string[];
  formatHours: (hours: number) => string;
}

export function PreContractedCasesByClientTable({
  data,
  clients,
  expandedClients,
  expandedSponsors,
  selectedWeekIndex,
  toggleClient,
  toggleSponsor,
  getSponsorsForClient,
  formatHours,
}: PreContractedCasesByClientTableProps) {
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
          {clients.map((clientName) => (
            <React.Fragment key={clientName}>
              <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleClient(`precontracted-client-${clientName}`)}>
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedClients.has(`precontracted-client-${clientName}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {clientName}
                </TableCell>
                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                  const clientCases = week.preContractedCases.filter(
                    (c: any) => c.client === clientName
                  );
                  const totalActual = clientCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.actualWorkHours === 'number' ? c.actualWorkHours : 0), 0
                  );
                  const totalApproved = clientCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.approvedWorkHours === 'number' ? c.approvedWorkHours : 0), 0
                  );
                  const totalUnpaid = clientCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.possibleUnpaidHours === 'number' ? c.possibleUnpaidHours : 0), 0
                  );
                  const totalIdle = clientCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.possibleIdleHours === 'number' ? c.possibleIdleHours : 0), 0
                  );
                  const totalInContext = clientCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.inContextActualWorkHours === 'number' ? c.inContextActualWorkHours : 0), 0
                  );
                  
                  return (
                    <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                      {clientCases.length > 0 ? (
                        <div>
                          <div>{formatHours(totalActual)} / {formatHours(totalApproved)}</div>
                          {totalUnpaid > 0 && (
                            <div className="text-orange-500 text-sm">
                              {formatHours(totalUnpaid)} unpaid
                            </div>
                          )}
                          {totalIdle > 0 && (
                            <div className="text-yellow-500 text-sm">
                              {formatHours(totalIdle)} idle
                            </div>
                          )}
                          {totalInContext !== totalActual && totalInContext > 0 && (
                            <div className="text-blue-500 text-sm">
                              {formatHours(totalInContext)} this month
                            </div>
                          )}
                        </div>
                      ) : "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
              {expandedClients.has(`precontracted-client-${clientName}`) && data.performanceAnalysis.weeks.length > 0 && 
                getSponsorsForClient(data.performanceAnalysis.weeks[0], clientName, false).map((sponsorName) => (
                  <React.Fragment key={`precontracted-${clientName}-${sponsorName}`}>
                    <TableRow 
                      className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                      onClick={() => toggleSponsor(`precontracted-client-${clientName}-${sponsorName}`)}
                    >
                      <TableCell className="pl-8 text-sm text-gray-500 flex items-center gap-2">
                        {expandedSponsors.has(`precontracted-client-${clientName}-${sponsorName}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {sponsorName}
                      </TableCell>
                      {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                        const sponsorCases = week.preContractedCases.filter(
                          (c: any) => c.client === clientName && c.sponsor === sponsorName
                        );
                        const totalActual = sponsorCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                        const totalApproved = sponsorCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                        const totalUnpaid = sponsorCases.reduce((sum: number, c: any) => sum + c.possibleUnpaidHours, 0);
                        const totalIdle = sponsorCases.reduce((sum: number, c: any) => sum + c.possibleIdleHours, 0);
                        const totalInContext = sponsorCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                        
                        return (
                          <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                            {sponsorCases.length > 0 ? (
                              <div>
                                <div>{formatHours(totalActual)} / {formatHours(totalApproved)}</div>
                                {totalUnpaid > 0 && (
                                  <div className="text-orange-500 text-sm">
                                    {formatHours(totalUnpaid)} unpaid
                                  </div>
                                )}
                                {totalIdle > 0 && (
                                  <div className="text-yellow-500 text-sm">
                                    {formatHours(totalIdle)} idle
                                  </div>
                                )}
                                {totalInContext !== totalActual && totalInContext > 0 && (
                                  <div className="text-blue-500 text-sm">
                                    {formatHours(totalInContext)} this month
                                  </div>
                                )}
                              </div>
                            ) : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {expandedSponsors.has(`precontracted-client-${clientName}-${sponsorName}`) && (
                      <>
                        {data.performanceAnalysis.weeks[0].preContractedCases
                          .filter((c: any) => c.client === clientName && c.sponsor === sponsorName)
                          .map((baseCase: any) => (
                            <TableRow key={`${clientName}-${sponsorName}-${baseCase.title}`} className="bg-gray-200">
                              <TableCell className="pl-12 text-sm text-gray-500">
                                {baseCase.title}
                              </TableCell>
                              {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                                const currentCase = week.preContractedCases.find(
                                  (c: any) => 
                                    c.client === clientName && 
                                    c.sponsor === sponsorName && 
                                    c.title === baseCase.title
                                );
                                
                                return (
                                  <TableCell 
                                    key={week.start} 
                                    className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}
                                  >
                                    {currentCase ? (
                                      <div>
                                        <div>
                                          {formatHours(currentCase.actualWorkHours)} / {formatHours(currentCase.approvedWorkHours)}
                                        </div>
                                        {currentCase.possibleUnpaidHours > 0 && (
                                          <div className="text-orange-500 text-sm">
                                            {formatHours(currentCase.possibleUnpaidHours)} unpaid
                                          </div>
                                        )}
                                        {currentCase.possibleIdleHours > 0 && (
                                          <div className="text-yellow-500 text-sm">
                                            {formatHours(currentCase.possibleIdleHours)} idle
                                          </div>
                                        )}
                                        {currentCase.inContextActualWorkHours !== currentCase.actualWorkHours && 
                                         currentCase.inContextActualWorkHours > 0 && (
                                          <div className="text-blue-500 text-sm">
                                            {formatHours(currentCase.inContextActualWorkHours)} this month
                                          </div>
                                        )}
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        }
                      </>
                    )}
                  </React.Fragment>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 