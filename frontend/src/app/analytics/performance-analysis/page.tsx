"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { PERFORMANCE_ANALYSIS_QUERY } from "./query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";

export default function PerformanceAnalysisPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  // Create a new Date object to avoid mutating the original date
  const firstDayOfMonth = new Date(date);
  firstDayOfMonth.setDate(1);
  const defaultDate = format(firstDayOfMonth, "yyyy-MM-dd");

  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: defaultDate },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleWeekClick = (weekStart: string, isDisabled: boolean) => {
    if (!isDisabled) {
      setSelectedWeek(selectedWeek === weekStart ? null : weekStart);
      setSelectedManager(null);
      setSelectedClient(null);
      setSelectedSponsor(null);
    }
  };

  const handleManagerClick = (managerName: string) => {
    setSelectedManager(selectedManager === managerName ? null : managerName);
    setSelectedClient(null);
    setSelectedSponsor(null);
  };

  const handleClientClick = (clientName: string) => {
    setSelectedClient(selectedClient === clientName ? null : clientName);
    setSelectedSponsor(null);
  };

  const handleSponsorClick = (sponsorName: string) => {
    setSelectedSponsor(selectedSponsor === sponsorName ? null : sponsorName);
  };

  const getWeekClassName = (weekStart: string, isDisabled: boolean) => {
    return `h-fit transition-all duration-300 ${
      isDisabled ? 'opacity-50' : 'cursor-pointer hover:scale-102'
    } ${
      selectedWeek === weekStart && !isDisabled
        ? "ring-2 ring-black shadow-lg scale-105"
        : ""
    }`;
  };

  const getManagerClassName = (managerName: string) => {
    return `h-fit transition-all duration-300 cursor-pointer hover:scale-102 ${
      selectedManager === managerName
        ? "ring-2 ring-black shadow-lg scale-105"
        : ""
    }`;
  };

  const getClientClassName = (clientName: string) => {
    return `h-fit transition-all duration-300 cursor-pointer hover:scale-102 ${
      selectedClient === clientName
        ? "ring-2 ring-black shadow-lg scale-105"
        : ""
    }`;
  };

  const getSponsorClassName = (sponsorName: string) => {
    return `h-fit transition-all duration-300 cursor-pointer hover:scale-102 ${
      selectedSponsor === sponsorName
        ? "ring-2 ring-black shadow-lg scale-105"
        : ""
    }`;
  };

  const formatHours = (hours: number) => {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  const renderMetricsCard = (title: string, metrics: any, type: 'regular' | 'preContracted') => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <span className="text-xs font-semibold text-gray-600 block mb-2">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-gray-900">{formatHours(metrics.actualWorkHours)}</span>
        <span className="text-xs text-gray-500">/ {formatHours(metrics.approvedWorkHours)}</span>
      </div>
      {metrics.actualWorkHours !== metrics.inContextActualWorkHours && (
        <div className="text-xs text-gray-500 mt-1">
          {formatHours(metrics.inContextActualWorkHours)} in {format(date, 'MMMM')}
        </div>
      )}
      {type === 'regular' && metrics.wastedHours > 0 && (
        <Badge color="red" className="mt-2">
          {formatHours(metrics.wastedHours)} wasted
        </Badge>
      )}
      {type === 'preContracted' && (
        <div className="flex gap-2 mt-2 whitespace-nowrap">
          {metrics.possibleUnpaidHours > 0 && (
            <Badge color="orange">
              {formatHours(metrics.possibleUnpaidHours)} unpaid
            </Badge>
          )}
          {metrics.possibleIdleHours > 0 && (
            <Badge color="yellow">
              {formatHours(metrics.possibleIdleHours)} idle
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  const renderCaseMetrics = (caseItem: any, type: 'regular' | 'preContracted') => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-gray-900">{formatHours(caseItem.actualWorkHours)}</span>
        <span className="text-xs text-gray-500">/ {formatHours(caseItem.approvedWorkHours)}</span>
      </div>
      {caseItem.actualWorkHours !== caseItem.inContextActualWorkHours && (
        <div className="text-xs text-gray-500 mt-1">
          {formatHours(caseItem.inContextActualWorkHours)} in {format(date, 'MMMM')}
        </div>
      )}
      {type === 'regular' && caseItem.wastedHours > 0 && (
        <Badge color="red" className="mt-2">
          {formatHours(caseItem.wastedHours)} wasted
        </Badge>
      )}
      {type === 'preContracted' && (
        <div className="flex gap-2 mt-2 whitespace-nowrap">
          {caseItem.possibleUnpaidHours > 0 && (
            <Badge color="orange">
              {formatHours(caseItem.possibleUnpaidHours)} unpaid
            </Badge>
          )}
          {caseItem.possibleIdleHours > 0 && (
            <Badge color="yellow">
              {formatHours(caseItem.possibleIdleHours)} idle
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  const selectedWeekData = data.performanceAnalysis.weeks.find(
    (week: any) => week.start === selectedWeek
  );

  const selectedManagerData = selectedWeekData?.accountManagers.find(
    (manager: any) => manager.name === selectedManager
  );

  const selectedClientData = selectedManagerData?.clients?.find(
    (client: any) => client.name === selectedClient
  );

  const selectedSponsorData = selectedClientData?.sponsors?.find(
    (sponsor: any) => sponsor.name === selectedSponsor
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {data.performanceAnalysis.weeks.map((week: any) => {
          const isWeekDisabled = new Date(week.start) > date;
          
          return (
            <Card 
              key={week.start} 
              className={getWeekClassName(week.start, isWeekDisabled)}
              onClick={() => handleWeekClick(week.start, isWeekDisabled)}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">
                  {format(new Date(week.start), "MMMM d")} - {format(new Date(week.end), "d, yyyy")}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {renderMetricsCard('Regular', week.totals.regular, 'regular')}
                  {renderMetricsCard('Pre-Contracted', week.totals.preContracted, 'preContracted')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedWeekData && (
        <>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-900 uppercase">Account Managers</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {selectedWeekData.accountManagers.map((manager: any) => (
              <Card 
                key={manager.name} 
                className={getManagerClassName(manager.name)}
                onClick={() => handleManagerClick(manager.name)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">
                    {manager.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {renderMetricsCard('Regular', manager.totals.regular, 'regular')}
                    {renderMetricsCard('Pre-Contracted', manager.totals.preContracted, 'preContracted')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedManagerData && (
            <>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900 uppercase">Clients</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {selectedManagerData.clients?.map((client: any) => (
                  <Card 
                    key={client.name} 
                    className={getClientClassName(client.name)}
                    onClick={() => handleClientClick(client.name)}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-medium">
                        {client.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {renderMetricsCard('Regular', client.totals.regular, 'regular')}
                        {renderMetricsCard('Pre-Contracted', client.totals.preContracted, 'preContracted')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedClientData && (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900 uppercase">Sponsors</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {selectedClientData.sponsors?.map((sponsor: any) => (
                      <Card 
                        key={sponsor.name} 
                        className={getSponsorClassName(sponsor.name)}
                        onClick={() => handleSponsorClick(sponsor.name)}
                      >
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base font-medium">
                            {sponsor.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {renderMetricsCard('Regular', sponsor.totals.regular, 'regular')}
                            {renderMetricsCard('Pre-Contracted', sponsor.totals.preContracted, 'preContracted')}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedSponsorData && (
                    <>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-900 uppercase">Cases</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {selectedSponsorData.regularCases?.map((caseItem: any) => (
                          <Card key={caseItem.title} className="h-fit">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-base font-medium">
                                {caseItem.title}
                                <span className="text-xs font-semibold text-gray-600 block mt-1">Regular</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderCaseMetrics(caseItem, 'regular')}
                            </CardContent>
                          </Card>
                        ))}
                        {selectedSponsorData.preContractedCases?.map((caseItem: any) => (
                          <Card key={caseItem.title} className="h-fit">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-base font-medium">
                                {caseItem.title}
                                <span className="text-xs font-semibold text-gray-600 block mt-1">Pre-Contracted</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderCaseMetrics(caseItem, 'preContracted')}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
