import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/catalyst/badge";
import { STAT_COLORS } from "@/app/constants/colors";

interface CasesTableProps {
  filteredCases: any[];
  showSponsorColumn?: boolean;
}

interface TrackingProject {
  id: string;
  name: string;
  kind: string;
  budget?: {
    hours: number;
    period: string;
  };
}

export function CasesTable({ filteredCases, showSponsorColumn = true }: CasesTableProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Critical":
        return "bg-rose-500";
      case "Requires attention":
        return "bg-amber-500";
      case "All right":
        return "bg-lime-500";
      default:
        return "bg-zinc-500";
    }
  };

  const getDaysSinceUpdate = (updateDate: string | null) => {
    if (!updateDate) return null;
    const update = new Date(updateDate);
    const today = new Date();
    const diffTime = today.getTime() - update.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilEnd = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not defined";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Sort cases alphabetically by title
  const sortedCases = [...filteredCases].sort((a, b) => 
    a.caseDetails.title.localeCompare(b.caseDetails.title)
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="font-semibold text-left w-[360px]">Case</TableHead>
          {showSponsorColumn && (
            <TableHead className="font-semibold text-left">Sponsor</TableHead>
          )}
          <TableHead className="font-semibold text-left">Contract Period</TableHead>
          <TableHead className="font-semibold text-left">Projects & Team Members</TableHead>
          <TableHead className="font-semibold text-left">CWH</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCases.map((caseData: any, index: number) => {
          const daysSinceUpdate = getDaysSinceUpdate(
            caseData.caseDetails.lastUpdate?.date
          );
          const daysUntilEnd = getDaysUntilEnd(caseData.caseDetails.endOfContract);
          return (
            <TableRow
              key={caseData.caseDetails.id}
              className={`hover:bg-gray-50 transition-all duration-300 ease-in-out ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <TableCell className="w-[330px]">
                <Link href={`/about-us/cases/${caseData.caseDetails.slug}`}>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${caseData.caseDetails.lastUpdate ? getStatusColor(caseData.caseDetails.lastUpdate.status) : 'bg-zinc-500'}`} 
                        title={caseData.caseDetails.lastUpdate?.status || 'No status'}
                      />
                      <div className="flex items-center gap-2">
                        {caseData.caseDetails.preContractedValue === "PRE" && (
                          <Badge color="blue">PRE</Badge>
                        )}
                        <p className="w-[325px] text-xs whitespace-normal break-words leading-tight">
                          {caseData.caseDetails.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs pl-4">
                      {caseData.caseDetails.lastUpdate ? (
                        <>
                          {daysSinceUpdate !== null && (
                            <span className={daysSinceUpdate > 30 ? "text-red-500" : "text-gray-500"}>
                              {daysSinceUpdate} days since last update
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-red-500">
                          No update information
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </TableCell>
              {showSponsorColumn && (
                <TableCell>
                  <span className="text-xs text-gray-600">
                    {caseData.caseDetails.sponsor || "No sponsor"}
                  </span>
                </TableCell>
              )}
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs text-green-600">
                    {formatDate(caseData.caseDetails.startOfContract)}
                  </span>
                  <span className="text-xs text-red-600">
                    {formatDate(caseData.caseDetails.endOfContract)}
                  </span>
                  {daysUntilEnd !== null && daysUntilEnd > 0 && (
                    <span className={`text-xs ${daysUntilEnd <= 30 ? "text-red-500" : "text-gray-500"}`}>
                      {daysUntilEnd} days remaining
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {caseData.caseDetails.tracker && caseData.caseDetails.tracker.length > 0 ? (
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      {caseData.caseDetails.tracker.map((track: TrackingProject) => {
                        const projectWorkers = caseData.workersByTrackingProject?.find(
                          (project: { projectId: string }) => project.projectId === track.id
                        )?.workers || [];
                        
                        const textColor = STAT_COLORS[track.kind as keyof typeof STAT_COLORS];
                        
                        return (
                          <React.Fragment key={track.id}>
                            {projectWorkers.length > 0 ? (
                              projectWorkers.map((worker: string) => (
                                <tr key={`${track.id}-${worker}`} className="border-b border-gray-200">
                                  <td className="pr-2 w-[210px] break-words border-r border-gray-200">
                                    <div style={{ color: textColor }}>
                                      {track.name}
                                      {track.budget && (
                                        <div className="text-gray-500 mt-1">
                                          <span className="inline-block bg-gray-100 px-1 rounded">
                                            {track.budget.hours}h/{track.budget.period}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-gray-600 pl-2">{worker}</td>
                                </tr>
                              ))
                            ) : (
                              <tr key={track.id} className="border-b border-gray-200">
                                <td className="pr-2 w-[210px] break-words border-r border-gray-200">
                                  <div style={{ color: textColor }}>
                                    {track.name}
                                    {track.budget && (
                                      <div className="text-gray-500 mt-1">
                                        <span className="inline-block bg-gray-100 px-1 rounded">
                                          {track.budget.hours}h/{track.budget.period}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="text-gray-400 pl-2">No team members</td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <span className="text-xs text-gray-400">No tracking projects</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs text-gray-600">
                  {caseData.caseDetails.weeklyApprovedHours || 0}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}