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

interface PreContractedCasesTableProps {
  data: any;
  accountManagers: string[];
  expandedPreContractedManagers: Set<string>;
  expandedClients: Set<string>;
  expandedSponsors: Set<string>;
  selectedWeekIndex: number;
  togglePreContractedManager: (manager: string) => void;
  toggleClient: (clientKey: string) => void;
  toggleSponsor: (sponsorKey: string) => void;
  getClientsForManager: (week: any, managerName: string, isRegular: boolean) => string[];
  getSponsorsForClient: (week: any, managerName: string, clientName: string, isRegular: boolean) => string[];
  formatHours: (hours: number) => string;
}

export function PreContractedCasesTable({
  data,
  accountManagers,
  expandedPreContractedManagers,
  expandedClients,
  expandedSponsors,
  selectedWeekIndex,
  togglePreContractedManager,
  toggleClient,
  toggleSponsor,
  getClientsForManager,
  getSponsorsForClient,
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
          {accountManagers.map((managerName) => (
            <>
              <TableRow key={managerName} className="cursor-pointer hover:bg-gray-50" onClick={() => togglePreContractedManager(managerName)}>
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedPreContractedManagers.has(managerName) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {managerName}
                </TableCell>
                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                  const managerCases = week.preContractedCases.filter(
                    (c: any) => c.accountManager === managerName
                  );
                  const totalActual = managerCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                  const totalApproved = managerCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                  const totalUnpaid = managerCases.reduce((sum: number, c: any) => sum + c.possibleUnpaidHours, 0);
                  const totalIdle = managerCases.reduce((sum: number, c: any) => sum + c.possibleIdleHours, 0);
                  const totalInContext = managerCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                  
                  return (
                    <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                      {managerCases.length > 0 ? (
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
              {expandedPreContractedManagers.has(managerName) && data.performanceAnalysis.weeks.length > 0 && 
                getClientsForManager(data.performanceAnalysis.weeks[0], managerName, false).map((clientName) => (
                  <>
                    <TableRow 
                      key={`${managerName}-${clientName}`} 
                      className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleClient(`precontracted-${managerName}-${clientName}`)}
                    >
                      <TableCell className="pl-8 text-sm text-gray-600 flex items-center gap-2">
                        {expandedClients.has(`precontracted-${managerName}-${clientName}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {clientName}
                      </TableCell>
                      {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                        const clientCases = week.preContractedCases.filter(
                          (c: any) => c.accountManager === managerName && c.client === clientName
                        );
                        const totalActual = clientCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                        const totalApproved = clientCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                        const totalUnpaid = clientCases.reduce((sum: number, c: any) => sum + c.possibleUnpaidHours, 0);
                        const totalIdle = clientCases.reduce((sum: number, c: any) => sum + c.possibleIdleHours, 0);
                        const totalInContext = clientCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                        
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
                    {expandedClients.has(`precontracted-${managerName}-${clientName}`) && 
                      getSponsorsForClient(data.performanceAnalysis.weeks[0], managerName, clientName, false).map((sponsorName) => (
                        <>
                          <TableRow 
                            key={`${managerName}-${clientName}-${sponsorName}`} 
                            className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                            onClick={() => toggleSponsor(`precontracted-${managerName}-${clientName}-${sponsorName}`)}
                          >
                            <TableCell className="pl-12 text-sm text-gray-500 flex items-center gap-2">
                              {expandedSponsors.has(`precontracted-${managerName}-${clientName}-${sponsorName}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              {sponsorName}
                            </TableCell>
                            {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                              const sponsorCases = week.preContractedCases.filter(
                                (c: any) => c.accountManager === managerName && 
                                          c.client === clientName && 
                                          c.sponsor === sponsorName
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
                          {expandedSponsors.has(`precontracted-${managerName}-${clientName}-${sponsorName}`) && (
                            <TableRow key={`${managerName}-${clientName}-${sponsorName}-cases`}>
                              <TableCell className="pl-16 text-sm text-gray-500">
                                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                                  const cases = week.preContractedCases.filter(
                                    (c: any) => c.accountManager === managerName && 
                                              c.client === clientName && 
                                              c.sponsor === sponsorName
                                  );
                                  return cases.map((c: any) => (
                                    <div key={`${week.start}-${c.title}`}>
                                      {weekIndex === 0 && c.title}
                                    </div>
                                  ));
                                })}
                              </TableCell>
                              {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                                const cases = week.preContractedCases.filter(
                                  (c: any) => c.accountManager === managerName && 
                                            c.client === clientName && 
                                            c.sponsor === sponsorName
                                );
                                return (
                                  <TableCell key={week.start} className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                                    {cases.map((c: any) => (
                                      <div key={`${week.start}-${c.title}`}>
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
                        </>
                      ))
                    }
                  </>
                ))
              }
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 