"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { PERFORMANCE_ANALYSIS_QUERY } from "./query";
import { RegularCasesTable } from "./RegularCasesTable";
import { PreContractedCasesTable } from "./PreContractedCasesTable";
import { RegularCasesByClientTable } from "./RegularCasesByClientTable";
import { PreContractedCasesByClientTable } from "./PreContractedCasesByClientTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegularCasesCTA } from "./RegularCasesCTA";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PerformanceAnalysisPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"managers" | "clients">("managers");
  const [expandedRegularManagers, setExpandedRegularManagers] = useState<Set<string>>(new Set());
  const [expandedPreContractedManagers, setExpandedPreContractedManagers] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: format(date, "yyyy-MM-dd") }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const formatHours = (hours: number) => {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

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

  const selectedWeekIndex = data.performanceAnalysis.pivoted.regular.byAccountManager[0].weeks.findIndex(
    (week: any) => {
      const weekStart = new Date(week.start);
      const weekEnd = new Date(week.end);
      return date >= weekStart && date < weekEnd;
    }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>
      
      <Tabs defaultValue="managers" className="ml-2 mr-2" onValueChange={(value) => setViewMode(value as "managers" | "clients")}>
        <TabsList>
          <TabsTrigger value="managers">By Account Managers</TabsTrigger>
          <TabsTrigger value="clients">By Clients</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-8 ml-2 mr-2">
        {selectedWeekIndex > 0 && (
          <RegularCasesCTA data={data} selectedWeekIndex={selectedWeekIndex} formatHours={formatHours} />
        )}
        
        {viewMode === "managers" ? (
          <>
            <RegularCasesTable
              data={data}
              expandedRegularManagers={expandedRegularManagers}
              expandedClients={expandedClients}
              selectedWeekIndex={selectedWeekIndex}
              expandedSponsors={expandedSponsors}
              toggleRegularManager={toggleRegularManager}
              toggleClient={toggleClient}
              toggleSponsor={toggleSponsor}
              formatHours={formatHours}
            />

            <PreContractedCasesTable
              data={data}
              expandedPreContractedManagers={expandedPreContractedManagers}
              expandedClients={expandedClients}
              selectedWeekIndex={selectedWeekIndex}
              expandedSponsors={expandedSponsors}
              togglePreContractedManager={togglePreContractedManager}
              toggleClient={toggleClient}
              toggleSponsor={toggleSponsor}
              formatHours={formatHours}
            />
          </>
        ) : (
          <>
            <RegularCasesByClientTable
              data={data}
              expandedClients={expandedClients}
              expandedSponsors={expandedSponsors}
              selectedWeekIndex={selectedWeekIndex}
              toggleClient={toggleClient}
              toggleSponsor={toggleSponsor}
              formatHours={formatHours}
            />

            <PreContractedCasesByClientTable
              data={data}
              expandedClients={expandedClients}
              expandedSponsors={expandedSponsors}
              selectedWeekIndex={selectedWeekIndex}
              toggleClient={toggleClient}
              toggleSponsor={toggleSponsor}
              formatHours={formatHours}
            />
          </>
        )}
      </div>
    </div>
  );
}
