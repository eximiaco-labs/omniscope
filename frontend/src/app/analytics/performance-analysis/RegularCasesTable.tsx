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

interface RegularCasesTableProps {
  data: any;
  accountManagers: string[];
  expandedRegularManagers: Set<string>;
  expandedClients: Set<string>;
  expandedSponsors: Set<string>;
  selectedWeekIndex: number;
  toggleRegularManager: (manager: string) => void;
  toggleClient: (clientKey: string) => void;
  toggleSponsor: (sponsorKey: string) => void;
  getClientsForManager: (week: any, managerName: string, isRegular: boolean) => string[];
  getSponsorsForClient: (week: any, managerName: string, clientName: string, isRegular: boolean) => string[];
  formatHours: (hours: number) => string;
}

export function RegularCasesTable({
  data,
  accountManagers,
  expandedRegularManagers,
  expandedClients,
  expandedSponsors,
  selectedWeekIndex,
  toggleRegularManager,
  toggleClient,
  toggleSponsor,
  getClientsForManager,
  getSponsorsForClient,
  formatHours,
}: RegularCasesTableProps) {
  return (
    <div>
      <SectionHeader title="Regular" subtitle="" />
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
              <TableRow key={managerName} className="cursor-pointer hover:bg-gray-50" onClick={() => toggleRegularManager(managerName)}>
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedRegularManagers.has(managerName) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {managerName}
                </TableCell>
                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                  const managerCases = week.regularCases.filter(
                    (c: any) => c.accountManager === managerName
                  );
                  const totalActual = managerCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.actualWorkHours === 'number' ? c.actualWorkHours : 0), 0
                  );
                  const totalApproved = managerCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.approvedWorkHours === 'number' ? c.approvedWorkHours : 0), 0
                  );
                  const totalWasted = managerCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.wastedHours === 'number' ? c.wastedHours : 0), 0
                  );
                  const totalInContext = managerCases.reduce((sum: number, c: any) => 
                    sum + (typeof c.inContextActualWorkHours === 'number' ? c.inContextActualWorkHours : 0), 0
                  );
                  
                  return (
                    <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                      {managerCases.length > 0 ? (
                        <div>
                          <div>{formatHours(totalActual)} / {formatHours(totalApproved)}</div>
                          {totalWasted > 0 && (
                            <div className="text-red-500 text-sm">
                              {formatHours(totalWasted)} wasted
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
              {expandedRegularManagers.has(managerName) && data.performanceAnalysis.weeks.length > 0 && 
                getClientsForManager(data.performanceAnalysis.weeks[0], managerName, true).map((clientName) => (
                  <>
                    <TableRow 
                      key={`${managerName}-${clientName}`} 
                      className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleClient(`regular-${managerName}-${clientName}`)}
                    >
                      <TableCell className="pl-8 text-sm text-gray-600 flex items-center gap-2">
                        {expandedClients.has(`regular-${managerName}-${clientName}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {clientName}
                      </TableCell>
                      {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                        const clientCases = week.regularCases.filter(
                          (c: any) => c.accountManager === managerName && c.client === clientName
                        );
                        const totalActual = clientCases.reduce((sum: number, c: any) => 
                          sum + (typeof c.actualWorkHours === 'number' ? c.actualWorkHours : 0), 0
                        );
                        const totalApproved = clientCases.reduce((sum: number, c: any) => 
                          sum + (typeof c.approvedWorkHours === 'number' ? c.approvedWorkHours : 0), 0
                        );
                        const totalWasted = clientCases.reduce((sum: number, c: any) => 
                          sum + (typeof c.wastedHours === 'number' ? c.wastedHours : 0), 0
                        );
                        const totalInContext = clientCases.reduce((sum: number, c: any) => 
                          sum + (typeof c.inContextActualWorkHours === 'number' ? c.inContextActualWorkHours : 0), 0
                        );
                        
                        return (
                          <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                            {clientCases.length > 0 ? (
                              <div>
                                <div>{formatHours(totalActual)} / {formatHours(totalApproved)}</div>
                                {totalWasted > 0 && (
                                  <div className="text-red-500 text-sm">
                                    {formatHours(totalWasted)} wasted
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
                    {expandedClients.has(`regular-${managerName}-${clientName}`) && 
                      getSponsorsForClient(data.performanceAnalysis.weeks[0], managerName, clientName, true).map((sponsorName) => (
                        <>
                          <TableRow 
                            key={`${managerName}-${clientName}-${sponsorName}`} 
                            className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                            onClick={() => toggleSponsor(`regular-${managerName}-${clientName}-${sponsorName}`)}
                          >
                            <TableCell className="pl-12 text-sm text-gray-500 flex items-center gap-2">
                              {expandedSponsors.has(`regular-${managerName}-${clientName}-${sponsorName}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              {sponsorName}
                            </TableCell>
                            {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                              const sponsorCases = week.regularCases.filter(
                                (c: any) => c.accountManager === managerName && 
                                          c.client === clientName && 
                                          c.sponsor === sponsorName
                              );
                              const totalActual = sponsorCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                              const totalApproved = sponsorCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                              const totalWasted = sponsorCases.reduce((sum: number, c: any) => sum + c.wastedHours, 0);
                              const totalInContext = sponsorCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                              
                              return (
                                <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                                  {sponsorCases.length > 0 ? (
                                    <div>
                                      <div>{formatHours(totalActual)} / {formatHours(totalApproved)}</div>
                                      {totalWasted > 0 && (
                                        <div className="text-red-500 text-sm">
                                          {formatHours(totalWasted)} wasted
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
                          {expandedSponsors.has(`regular-${managerName}-${clientName}-${sponsorName}`) && (
                            <TableRow key={`${managerName}-${clientName}-${sponsorName}-cases`}>
                              <TableCell className="pl-16 text-sm text-gray-500">
                                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                                  const cases = week.regularCases.filter(
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
                                const cases = week.regularCases.filter(
                                  (c: any) => c.accountManager === managerName && 
                                            c.client === clientName && 
                                            c.sponsor === sponsorName
                                );
                                return (
                                  <TableCell key={week.start} className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                                    {cases.map((c: any) => (
                                      <div key={`${week.start}-${c.title}`}>
                                        <div>{formatHours(c.actualWorkHours)} / {formatHours(c.approvedWorkHours)}</div>
                                        {c.wastedHours > 0 && (
                                          <div className="text-red-500 text-sm">
                                            {formatHours(c.wastedHours)} wasted
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