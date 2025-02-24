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
import SectionHeader from "@/components/SectionHeader";
import { NavBar } from "../../components/NavBar";
import Link from "next/link";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const sections = [
  { id: 'staleCases', title: 'Stale Cases', subtitle: '0 cases' },
  { id: 'staleInOneWeekCases', title: 'Stale in One Week', subtitle: '0 cases' },
  { id: 'staleInLessThan15DaysCases', title: 'Stale in Less Than 15 Days', subtitle: '0 cases' },
  { id: 'noDescriptionCases', title: 'Without Description', subtitle: '0 cases' },
  { id: 'upToDateCases', title: 'Up To Date', subtitle: '0 cases' },
];

export default function StalenessPage() {
  const client = useEdgeClient();
  const { data, loading, error } = useQuery(STALELINESS_QUERY, {
    client: client ?? undefined,
    ssr: true
  });
  const [sectionsWithPercentages, setSectionsWithPercentages] = useState(sections);

  useEffect(() => {
    if (data?.engagements?.summaries?.staleliness) {
      const updatedSections = sections.map(section => ({
        ...section,
        subtitle: `${data.engagements.summaries.staleliness[section.id].data.length} cases`
      }));
      setSectionsWithPercentages(updatedSections);
    }
  }, [data]);

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

  const staleliness = data?.engagements?.summaries?.staleliness;

  return (
    <div className="container">
      <NavBar sections={sectionsWithPercentages} />
      
      <div className="ml-2 mr-2">
        {sections.map(section => (
          <div 
            key={section.id}
            id={section.id}
            className="scroll-mt-[68px] sm:scroll-mt-[68px]"
          >
            {renderCaseTable(
              staleliness[section.id].data,
              section.title,
              section.subtitle
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
