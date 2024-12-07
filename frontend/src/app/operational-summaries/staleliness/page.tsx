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
import Link from "next/link";

const sections = [
  { id: 'stale', title: 'Stale Cases', subtitle: '0 cases' },
  { id: 'staleInOneWeek', title: 'Stale in One Week', subtitle: '0 cases' },
  { id: 'noDescription', title: 'Without Description', subtitle: '0 cases' },
  { id: 'upToDate', title: 'Up To Date', subtitle: '0 cases' },
];

export default function StalenessPage() {
  const { data, loading, error } = useQuery(STALELINESS_QUERY);
  const [sectionsWithPercentages, setSectionsWithPercentages] = useState(sections);

  useEffect(() => {
    if (data?.cases) {
      const categorized = categorizeCases(data.cases);
      const updatedSections = sections.map(section => ({
        ...section,
        subtitle: `${categorized[section.id].length} cases`
      }));
      setSectionsWithPercentages(updatedSections);
    }
  }, [data]);

  const categorizeCases = (cases: any[]) => {
    const now = new Date();
    
    return cases.reduce((acc: any, case_) => {
      const lastUpdated = case_.lastUpdated ? new Date(case_.lastUpdated) : null;
      const startOfContract = case_.startOfContract ? new Date(case_.startOfContract) : null;
      const daysSinceUpdate = lastUpdated ? differenceInDays(now, lastUpdated) : null;
      const daysSinceStart = startOfContract ? differenceInDays(now, startOfContract) : null;

      // New case (less than 14 days) without updates is considered up to date
      if (daysSinceStart !== null && daysSinceStart < 14 && !lastUpdated) {
        acc.upToDate.push({ ...case_, daysSinceUpdate: 0 });
      }
      // No description cases
      else if (!case_.hasDescription) {
        acc.noDescription.push({ ...case_, daysSinceUpdate: daysSinceUpdate || 0 });
      }
      // Stale cases (>21 days)
      else if (daysSinceUpdate && daysSinceUpdate > 21) {
        acc.stale.push({ ...case_, daysSinceUpdate });
      }
      // Will be stale in one week (14-21 days)
      else if (daysSinceUpdate && daysSinceUpdate >= 14) {
        acc.staleInOneWeek.push({ ...case_, daysSinceUpdate });
      }
      // Up to date cases
      else {
        acc.upToDate.push({ ...case_, daysSinceUpdate: daysSinceUpdate || 0 });
      }
      
      return acc;
    }, {
      stale: [],
      staleInOneWeek: [],
      noDescription: [],
      upToDate: []
    });
  };

  const renderCaseTable = (cases: any[], title: string, subtitle: string) => {
    // Sort cases by daysSinceUpdate in descending order
    const sortedCases = [...cases].sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
    
    return (
      <div className="mt-4 mb-8">
        <SectionHeader title={title} subtitle={`${cases.length} cases`} />
        <div className="ml-2 mr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Case Title</TableHead>
                <TableHead className="w-[200px]">Workers</TableHead>
                <TableHead className="w-[120px]">Last Updated</TableHead>
                <TableHead className="text-right w-[120px]">Days Without Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCases.map((case_, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/about-us/cases/${case_.slug}`} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {case_.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {case_.timesheet?.byWorker?.map((w: any, i: number) => (
                        <div key={i} className="text-xs">{w.name}</div>
                      )) || <div className="text-xs">No workers</div>}
                    </div>
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
      <NavBar sections={sectionsWithPercentages} />
      
      <div className="ml-2 mr-2">
        {Object.entries(categorizedCases).map(([category, cases]) => {
          const section = sectionsWithPercentages.find(s => s.id === category);
          return (
            <div 
              key={category}
              id={category}
              className="scroll-mt-[68px] sm:scroll-mt-[68px]"
            >
              {renderCaseTable(
                cases as any[],
                section?.title || "",
                section?.subtitle || ""
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
