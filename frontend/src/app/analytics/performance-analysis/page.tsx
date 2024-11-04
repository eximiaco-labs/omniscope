"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { PERFORMANCE_ANALYSIS_QUERY } from "./query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function PerformanceAnalysisPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [expandedRegularManagers, setExpandedRegularManagers] = useState<Set<string>>(new Set());
  const [expandedPreContractedManagers, setExpandedPreContractedManagers] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const firstDayOfMonth = new Date(date);
  firstDayOfMonth.setDate(1);
  const defaultDate = format(firstDayOfMonth, "yyyy-MM-dd");

  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: defaultDate },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Helper function to format hours
  const formatHours = (hours: number) => {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  // Get unique account managers and sort them
  const accountManagers = Array.from(new Set<string>(
    data.performanceAnalysis.weeks.flatMap((week: any) => [
      ...week.regularCases.map((c: any) => c.accountManager),
      ...week.preContractedCases.map((c: any) => c.accountManager)
    ])
  )).sort();

  const toggleRegularManager = (manager: string) => {
    const newExpanded = new Set(expandedRegularManagers);
    if (newExpanded.has(manager)) {
      newExpanded.delete(manager);
    } else {
      newExpanded.add(manager);
    }
    setExpandedRegularManagers(newExpanded);
  };

  const togglePreContractedManager = (manager: string) => {
    const newExpanded = new Set(expandedPreContractedManagers);
    if (newExpanded.has(manager)) {
      newExpanded.delete(manager);
    } else {
      newExpanded.add(manager);
    }
    setExpandedPreContractedManagers(newExpanded);
  };

  const toggleClient = (clientKey: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientKey)) {
      newExpanded.delete(clientKey);
    } else {
      newExpanded.add(clientKey);
    }
    setExpandedClients(newExpanded);
  };

  const toggleSponsor = (sponsorKey: string) => {
    const newExpanded = new Set(expandedSponsors);
    if (newExpanded.has(sponsorKey)) {
      newExpanded.delete(sponsorKey);
    } else {
      newExpanded.add(sponsorKey);
    }
    setExpandedSponsors(newExpanded);
  };

  const getClientsForManager = (week: any, managerName: string, isRegular: boolean): string[] => {
    const cases = isRegular ? week.regularCases : week.preContractedCases;
    return Array.from(new Set(
      cases
        .filter((c: any) => c.accountManager === managerName)
        .map((c: any) => c.client)
    )).sort();
  };

  const getSponsorsForClient = (week: any, managerName: string, clientName: string, isRegular: boolean): string[] => {
    const cases = isRegular ? week.regularCases : week.preContractedCases;
    return Array.from(new Set(
      cases
        .filter((c: any) => c.accountManager === managerName && c.client === clientName)
        .map((c: any) => c.sponsor)
    )).sort();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
      </div>

      <div className="space-y-8">
        {/* Regular Cases Table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Regular Cases</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Manager</TableHead>
                {data.performanceAnalysis.weeks.map((week: any) => (
                  <TableHead key={week.start} className="w-[150px]">
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
                    {data.performanceAnalysis.weeks.map((week: any) => {
                      const managerCases = week.regularCases.filter(
                        (c: any) => c.accountManager === managerName
                      );
                      const totalActual = managerCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                      const totalApproved = managerCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                      const totalWasted = managerCases.reduce((sum: number, c: any) => sum + c.wastedHours, 0);
                      const totalInContext = managerCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                      
                      return (
                        <TableCell key={week.start} className="w-[150px]">
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
                          {data.performanceAnalysis.weeks.map((week: any) => {
                            const clientCases = week.regularCases.filter(
                              (c: any) => c.accountManager === managerName && c.client === clientName
                            );
                            const totalActual = clientCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                            const totalApproved = clientCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                            const totalWasted = clientCases.reduce((sum: number, c: any) => sum + c.wastedHours, 0);
                            const totalInContext = clientCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                            
                            return (
                              <TableCell key={week.start} className="w-[150px]">
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
                                {data.performanceAnalysis.weeks.map((week: any) => {
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
                                    <TableCell key={week.start} className="w-[150px]">
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
                                  {data.performanceAnalysis.weeks.map((week: any) => {
                                    const cases = week.regularCases.filter(
                                      (c: any) => c.accountManager === managerName && 
                                                c.client === clientName && 
                                                c.sponsor === sponsorName
                                    );
                                    return (
                                      <TableCell key={week.start} className="bg-gray-200 w-[150px]">
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

        {/* Pre-Contracted Cases Table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Pre-Contracted Cases</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Manager</TableHead>
                {data.performanceAnalysis.weeks.map((week: any) => (
                  <TableHead key={week.start} className="w-[150px]">
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
                    {data.performanceAnalysis.weeks.map((week: any) => {
                      const managerCases = week.preContractedCases.filter(
                        (c: any) => c.accountManager === managerName
                      );
                      const totalActual = managerCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                      const totalApproved = managerCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                      const totalUnpaid = managerCases.reduce((sum: number, c: any) => sum + c.possibleUnpaidHours, 0);
                      const totalIdle = managerCases.reduce((sum: number, c: any) => sum + c.possibleIdleHours, 0);
                      const totalInContext = managerCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                      
                      return (
                        <TableCell key={week.start} className="w-[150px]">
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
                          {data.performanceAnalysis.weeks.map((week: any) => {
                            const clientCases = week.preContractedCases.filter(
                              (c: any) => c.accountManager === managerName && c.client === clientName
                            );
                            const totalActual = clientCases.reduce((sum: number, c: any) => sum + c.actualWorkHours, 0);
                            const totalApproved = clientCases.reduce((sum: number, c: any) => sum + c.approvedWorkHours, 0);
                            const totalUnpaid = clientCases.reduce((sum: number, c: any) => sum + c.possibleUnpaidHours, 0);
                            const totalIdle = clientCases.reduce((sum: number, c: any) => sum + c.possibleIdleHours, 0);
                            const totalInContext = clientCases.reduce((sum: number, c: any) => sum + c.inContextActualWorkHours, 0);
                            
                            return (
                              <TableCell key={week.start} className="w-[150px]">
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
                                {data.performanceAnalysis.weeks.map((week: any) => {
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
                                    <TableCell key={week.start} className="w-[150px]">
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
                                  {data.performanceAnalysis.weeks.map((week: any) => {
                                    const cases = week.preContractedCases.filter(
                                      (c: any) => c.accountManager === managerName && 
                                                c.client === clientName && 
                                                c.sponsor === sponsorName
                                    );
                                    return (
                                      <TableCell key={week.start} className="bg-gray-200 w-[150px]">
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
      </div>
    </div>
  );
}
