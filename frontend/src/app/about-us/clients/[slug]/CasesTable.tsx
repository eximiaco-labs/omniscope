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

interface CasesTableProps {
  filteredCases: any[];
}

export function CasesTable({ filteredCases }: CasesTableProps) {
  const getStatusColor = (status: string): "zinc" | "rose" | "amber" | "lime" => {
    switch (status) {
      case "Critical":
        return "rose";
      case "Requires attention":
        return "amber";
      case "All right":
        return "lime";
      default:
        return "zinc";
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

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="font-semibold text-left">Case</TableHead>
          <TableHead className="font-semibold text-left">Sponsor</TableHead>
          <TableHead className="font-semibold text-left">Tracking Projects</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredCases.map((caseData: any, index: number) => {
          const daysSinceUpdate = getDaysSinceUpdate(
            caseData.caseDetails.lastUpdate?.date
          );
          return (
            <TableRow
              key={caseData.caseDetails.id}
              className={`hover:bg-gray-50 transition-all duration-300 ease-in-out ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <TableCell>
                <Link href={`/about-us/cases/${caseData.caseDetails.slug}`}>
                  <div className="flex flex-col space-y-2">
                    <p className="text-base whitespace-normal break-words">
                      {caseData.caseDetails.title}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      {caseData.caseDetails.lastUpdate ? (
                        <Badge color={getStatusColor(caseData.caseDetails.lastUpdate.status)}>
                          {caseData.caseDetails.lastUpdate.status}
                        </Badge>
                      ) : <></> }
                      <div className="flex flex-col items-end">
                        {caseData.caseDetails.lastUpdate ? (
                          <>
                            {daysSinceUpdate !== null && (
                              <span className={`text-xs ${
                                daysSinceUpdate > 30
                                  ? "text-red-500 font-semibold"
                                  : "text-gray-500"
                              }`}>
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
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {caseData.caseDetails.sponsor || "No sponsor"}
                </span>
              </TableCell>
              <TableCell>
                {caseData.caseDetails.tracker && caseData.caseDetails.tracker.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {caseData.caseDetails.tracker.map((track: { id: string; name: string }, index: number) => (
                      <React.Fragment key={track.id}>
                        <span className="text-sm text-gray-600">
                          {track.name}
                        </span>
                        {index < caseData.caseDetails.tracker.length - 1 && (
                          <span className="text-gray-300">•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No tracking projects</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
} 