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
  expandedRegularManagers: Set<string>;
  expandedClients: Set<string>;
  expandedSponsors: Set<string>;
  selectedWeekIndex: number;
  toggleRegularManager: (manager: string) => void;
  toggleClient: (clientKey: string) => void;
  toggleSponsor: (sponsorKey: string) => void;
  formatHours: (hours: number) => string;
}

export function RegularCasesTable({
  data,
  expandedRegularManagers,
  expandedClients,
  expandedSponsors,
  selectedWeekIndex,
  toggleRegularManager,
  toggleClient,
  toggleSponsor,
  formatHours,
}: RegularCasesTableProps) {
  // Helper function to check if manager has any non-zero hours
  const hasNonZeroHours = (manager: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const managerData = week.accountManagers.find((m: any) => m.name === manager.name);
      const totals = managerData?.totals.regular;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if client has any non-zero hours
  const hasNonZeroClientHours = (manager: string, client: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const clientData = week.accountManagers
        .find((m: any) => m.name === manager)
        ?.clients.find((c: any) => c.name === client.name);
      const totals = clientData?.totals.regular;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if sponsor has any non-zero hours
  const hasNonZeroSponsorHours = (manager: string, client: string, sponsor: any) => {
    return data.performanceAnalysis.weeks.some((week: any) => {
      const sponsorData = week.accountManagers
        .find((m: any) => m.name === manager)
        ?.clients.find((c: any) => c.name === client)
        ?.sponsors.find((s: any) => s.name === sponsor.name);
      const totals = sponsorData?.totals.regular;
      return totals?.actualWorkHours > 0 || totals?.approvedWorkHours > 0;
    });
  };

  // Helper function to check if case has any non-zero hours
  const hasNonZeroCaseHours = (c: any) => {
    return c.actualWorkHours > 0 || c.approvedWorkHours > 0;
  };

  return (
    <div>
      <SectionHeader title="Regular Cases by Account Manager" subtitle="" />
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
          {data.performanceAnalysis.weeks[selectedWeekIndex].accountManagers
            .filter(hasNonZeroHours)
            .map((manager: any) => (
            <>
              <TableRow key={manager.name} className="cursor-pointer hover:bg-gray-50" onClick={() => toggleRegularManager(manager.name)}>
                <TableCell className="font-medium flex items-center gap-2">
                  {expandedRegularManagers.has(manager.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {manager.name}
                </TableCell>
                {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                  const managerData = week.accountManagers.find((m: any) => m.name === manager.name);
                  const totals = managerData?.totals.regular;
                  
                  return (
                    <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                      {totals ? (
                        <div>
                          <div>{formatHours(totals.actualWorkHours)} / {formatHours(totals.approvedWorkHours)}</div>
                          {totals.wastedHours > 0 && (
                            <div className="text-red-500 text-sm">
                              {formatHours(totals.wastedHours)} wasted
                            </div>
                          )}
                          {totals.overApprovedHours > 0 && (
                            <div className="text-orange-500 text-sm">
                              {formatHours(totals.overApprovedHours)} over
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
              {expandedRegularManagers.has(manager.name) && manager.clients
                .filter((client: any) => hasNonZeroClientHours(manager.name, client))
                .map((client: any) => (
                <>
                  <TableRow 
                    key={`${manager.name}-${client.name}`} 
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleClient(`regular-${manager.name}-${client.name}`)}
                  >
                    <TableCell className="pl-8 text-sm text-gray-600 flex items-center gap-2">
                      {expandedClients.has(`regular-${manager.name}-${client.name}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {client.name}
                    </TableCell>
                    {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                      const clientData = week.accountManagers
                        .find((m: any) => m.name === manager.name)
                        ?.clients.find((c: any) => c.name === client.name);
                      const totals = clientData?.totals.regular;
                      
                      return (
                        <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                          {totals ? (
                            <div>
                              <div>{formatHours(totals.actualWorkHours)} / {formatHours(totals.approvedWorkHours)}</div>
                              {totals.wastedHours > 0 && (
                                <div className="text-red-500 text-sm">
                                  {formatHours(totals.wastedHours)} wasted
                                </div>
                              )}
                              {totals.overApprovedHours > 0 && (
                                <div className="text-orange-500 text-sm">
                                  {formatHours(totals.overApprovedHours)} over
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
                  {expandedClients.has(`regular-${manager.name}-${client.name}`) && client.sponsors
                    .filter((sponsor: any) => hasNonZeroSponsorHours(manager.name, client.name, sponsor))
                    .map((sponsor: any) => (
                    <>
                      <TableRow 
                        key={`${manager.name}-${client.name}-${sponsor.name}`} 
                        className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                        onClick={() => toggleSponsor(`regular-${manager.name}-${client.name}-${sponsor.name}`)}
                      >
                        <TableCell className="pl-12 text-sm text-gray-500 flex items-center gap-2">
                          {expandedSponsors.has(`regular-${manager.name}-${client.name}-${sponsor.name}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {sponsor.name}
                        </TableCell>
                        {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                          const sponsorData = week.accountManagers
                            .find((m: any) => m.name === manager.name)
                            ?.clients.find((c: any) => c.name === client.name)
                            ?.sponsors.find((s: any) => s.name === sponsor.name);
                          const totals = sponsorData?.totals.regular;
                          
                          return (
                            <TableCell key={week.start} className={`w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                              {totals ? (
                                <div>
                                  <div>{formatHours(totals.actualWorkHours)} / {formatHours(totals.approvedWorkHours)}</div>
                                  {totals.wastedHours > 0 && (
                                    <div className="text-red-500 text-sm">
                                      {formatHours(totals.wastedHours)} wasted
                                    </div>
                                  )}
                                  {totals.overApprovedHours > 0 && (
                                    <div className="text-orange-500 text-sm">
                                      {formatHours(totals.overApprovedHours)} over
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
                      {expandedSponsors.has(`regular-${manager.name}-${client.name}-${sponsor.name}`) && (
                        <TableRow key={`${manager.name}-${client.name}-${sponsor.name}-cases`}>
                          <TableCell className="pl-16 text-sm text-gray-500">
                            {sponsor.regularCases
                              .filter(hasNonZeroCaseHours)
                              .map((c: any) => (
                              <div key={c.title}>{c.title}</div>
                            ))}
                          </TableCell>
                          {data.performanceAnalysis.weeks.map((week: any, weekIndex: number) => {
                            const cases = week.accountManagers
                              .find((m: any) => m.name === manager.name)
                              ?.clients.find((c: any) => c.name === client.name)
                              ?.sponsors.find((s: any) => s.name === sponsor.name)
                              ?.regularCases.filter(hasNonZeroCaseHours) || [];
                            
                            return (
                              <TableCell key={week.start} className={`bg-gray-200 w-[150px] ${weekIndex === selectedWeekIndex ? 'bg-blue-100' : ''} ${weekIndex > selectedWeekIndex ? 'opacity-50' : ''}`}>
                                {cases.map((c: any) => (
                                  <div key={c.title}>
                                    <div>{formatHours(c.actualWorkHours)} / {formatHours(c.approvedWorkHours)}</div>
                                    {c.wastedHours > 0 && (
                                      <div className="text-red-500 text-sm">
                                        {formatHours(c.wastedHours)} wasted
                                      </div>
                                    )}
                                    {c.overApprovedHours > 0 && (
                                      <div className="text-orange-500 text-sm">
                                        {formatHours(c.overApprovedHours)} over
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