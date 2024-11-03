'use client';

import { useQuery, gql } from '@apollo/client';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/DatePicker";

const PERFORMANCE_ANALYSIS_QUERY = gql`
  query PerformanceAnalysis($date: Date!) {
    performanceAnalysis(date_of_interest: $date) {
      start
      end
      dateOfInterest
      weeks {
        start
        end
        cases {
          id
          title
          sponsor
          client
          accountManager
          approvedWorkHours
          actualWorkHours
          isPreContracted
          possibleUnpaidHours
          possibleIdleHours
          wastedHours
        }
        clients {
          name
          accountManager
          totalApprovedWorkHours
          totalActualWorkHours
          totalPreContractedApprovedWorkHours
          totalNotPreContractedApprovedWorkHours
          totalPreContractedActualWorkHours
          totalNotPreContractedActualWorkHours
          totalWastedHours
          totalPossibleUnpaidHours
          totalPossibleIdleHours
        }
        sponsors {
          name
          accountManager
          totalApprovedWorkHours
          totalActualWorkHours
          totalPreContractedApprovedWorkHours
          totalNotPreContractedApprovedWorkHours
          totalPreContractedActualWorkHours
          totalNotPreContractedActualWorkHours
          totalWastedHours
          totalPossibleUnpaidHours
          totalPossibleIdleHours
        }
        accountManagers {
          name
          accountManager
          totalApprovedWorkHours
          totalActualWorkHours
          totalPreContractedApprovedWorkHours
          totalNotPreContractedApprovedWorkHours
          totalPreContractedActualWorkHours
          totalNotPreContractedActualWorkHours
          totalWastedHours
          totalPossibleUnpaidHours
          totalPossibleIdleHours
        }
        totalApprovedWorkHours
        totalPreContractedApprovedWorkHours
        totalNotPreContractedApprovedWorkHours
        totalActualWorkHours
        totalPreContractedActualWorkHours
        totalNotPreContractedActualWorkHours
        actualWorkHours {
          date
          hours
          preContractedWorkHours
          notPreContractedWorkHours
          byCase {
            caseId
            hours
            preContracted
          }
        }
      }
    }
  }
`;

export default function RevenueProjectionPage() {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const defaultDate = format(date.setDate(1), 'yyyy-MM-dd');
  
  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: defaultDate }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const performanceData = data.performanceAnalysis;

  const toggleExpand = (weekStart: string) => {
    setExpandedWeek(expandedWeek === weekStart ? null : weekStart);
  };

  const totalApprovedHours = performanceData.weeks.reduce((acc: number, week: any) => 
    acc + week.totalApprovedWorkHours, 0);
  const totalActualHours = performanceData.weeks.reduce((acc: number, week: any) => 
    acc + week.totalActualWorkHours, 0);
  const totalPreContractedApprovedHours = performanceData.weeks.reduce((acc: number, week: any) => 
    acc + week.totalPreContractedApprovedWorkHours, 0);
  const totalPreContractedActualHours = performanceData.weeks.reduce((acc: number, week: any) => 
    acc + week.totalPreContractedActualWorkHours, 0);

  return (
    <div className="p-6">
      <div className="mb-2 flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Performance Analysis</h1>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Week</TableHead>
              <TableHead className="text-right">Approved Hours</TableHead>
              <TableHead className="text-right">Actual Hours</TableHead>
              <TableHead className="text-right">Pre-contracted Approved</TableHead>
              <TableHead className="text-right">Pre-contracted Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.weeks.map((week: any) => (
              <>
                <TableRow 
                  key={week.start}
                  className="cursor-pointer bg-muted/50 font-semibold"
                  onClick={() => toggleExpand(week.start)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {expandedWeek === week.start ? '▼' : '▶'}
                      </span>
                      {format(new Date(week.start), 'MMM d')} - {format(new Date(week.end), 'MMM d')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{week.totalApprovedWorkHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{week.totalActualWorkHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{week.totalPreContractedApprovedWorkHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{week.totalPreContractedActualWorkHours.toFixed(2)}</TableCell>
                </TableRow>
                {expandedWeek === week.start && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <div className="pl-8 py-4">
                        <div className="space-y-8">
                          <div>
                            <h4 className="font-semibold mb-4">Pre-contracted Cases</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Case</TableHead>
                                  <TableHead>Client</TableHead>
                                  <TableHead>Sponsor</TableHead>
                                  <TableHead className="text-right">Approved Hours</TableHead>
                                  <TableHead className="text-right">Actual Hours</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {week.cases
                                  .filter((caseData: any) => caseData.isPreContracted)
                                  .map((caseData: any) => (
                                    <TableRow key={caseData.id}>
                                      <TableCell>{caseData.title}</TableCell>
                                      <TableCell>{caseData.client}</TableCell>
                                      <TableCell>{caseData.sponsor}</TableCell>
                                      <TableCell className="text-right">
                                        {caseData.approvedWorkHours.toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {caseData.actualWorkHours.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-4">Non Pre-contracted Cases</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Case</TableHead>
                                  <TableHead>Client</TableHead>
                                  <TableHead>Sponsor</TableHead>
                                  <TableHead className="text-right">Approved Hours</TableHead>
                                  <TableHead className="text-right">Actual Hours</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {week.cases
                                  .filter((caseData: any) => !caseData.isPreContracted)
                                  .map((caseData: any) => (
                                    <TableRow key={caseData.id}>
                                      <TableCell>{caseData.title}</TableCell>
                                      <TableCell>{caseData.client}</TableCell>
                                      <TableCell>{caseData.sponsor}</TableCell>
                                      <TableCell className="text-right">
                                        {caseData.approvedWorkHours.toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {caseData.actualWorkHours.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            <TableRow className="font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totalApprovedHours.toFixed(2)}</TableCell>
              <TableCell className="text-right">{totalActualHours.toFixed(2)}</TableCell>
              <TableCell className="text-right">{totalPreContractedApprovedHours.toFixed(2)}</TableCell>
              <TableCell className="text-right">{totalPreContractedActualHours.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
