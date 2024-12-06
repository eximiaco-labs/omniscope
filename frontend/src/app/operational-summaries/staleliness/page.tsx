"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { STALELINESS_QUERY } from "./query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { differenceInDays } from "date-fns";
import SectionHeader from "@/components/SectionHeader";
import { NavBar } from "../../components/NavBar";

const sections = [
  { id: 'veryStale', title: 'Cases Without Updates > 30 Days', subtitle: '0%' },
  { id: 'stale', title: 'Cases Without Updates 21-30 Days', subtitle: '0%' },
  { id: 'noDescription', title: 'Cases Without Description', subtitle: '0%' },
  { id: 'upToDate', title: 'Up To Date Cases', subtitle: '0%' },
];

export default function StalenessPage() {
  const { data, loading, error } = useQuery(STALELINESS_QUERY);
  const [sectionsWithPercentages, setSectionsWithPercentages] = useState(sections);

  const categorizeCases = (cases: any[]) => {
    const now = new Date();
    
    return cases.reduce((acc: any, case_) => {
      const lastUpdated = case_.lastUpdated ? new Date(case_.lastUpdated) : null;
      const startOfContract = case_.startOfContract ? new Date(case_.startOfContract) : null;
      const daysSinceUpdate = lastUpdated ? differenceInDays(now, lastUpdated) : null;
      const daysSinceStart = startOfContract ? differenceInDays(now, startOfContract) : null;

      // New case (less than 21 days) without updates is considered up to date
      if (daysSinceStart !== null && daysSinceStart < 21 && !lastUpdated) {
        acc.upToDate.push({ ...case_, daysSinceUpdate: 0 });
      }
      // No description cases
      else if (!case_.hasDescription) {
        acc.noDescription.push({ ...case_, daysSinceUpdate: daysSinceUpdate || 0 });
      }
      // Very stale cases (>30 days)
      else if (daysSinceUpdate && daysSinceUpdate > 30) {
        acc.veryStale.push({ ...case_, daysSinceUpdate });
      }
      // Stale cases (21-30 days)
      else if (daysSinceUpdate && daysSinceUpdate >= 21) {
        acc.stale.push({ ...case_, daysSinceUpdate });
      }
      // Up to date cases
      else {
        acc.upToDate.push({ ...case_, daysSinceUpdate: daysSinceUpdate || 0 });
      }
      
      return acc;
    }, {
      veryStale: [],
      stale: [],
      noDescription: [],
      upToDate: []
    });
  };

  const renderCaseTable = (cases: any[], title: string) => {
    return (
      <div className="mt-4">
        <SectionHeader title={title} subtitle={`${cases.length} cases`} />
        <div className="ml-2 mr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Title</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Days Without Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((case_, index) => (
                <TableRow key={index}>
                  <TableCell>{case_.title}</TableCell>
                  <TableCell>
                    {case_.timesheet?.byWorker?.map((w: any) => w.name).join(", ") || "No workers"}
                  </TableCell>
                  <TableCell>
                    {case_.lastUpdated 
                      ? new Date(case_.lastUpdated).toLocaleDateString()
                      : "Never updated"}
                  </TableCell>
                  <TableCell className="text-right">{case_.daysSinceUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const categorizedCases = categorizeCases(data.cases);

  return (
    <div className="container">
      <NavBar sections={sections} />
      
      <div className="ml-2 mr-2">
        {Object.entries(categorizedCases).map(([category, cases]) => (
          <div 
            key={category}
            id={category}
            className="scroll-mt-[68px] sm:scroll-mt-[68px]"
          >
            {renderCaseTable(
              cases as any[],
              sections.find(s => s.id === category)?.title || ""
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
