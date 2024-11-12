"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_CASE_BY_SLUG } from "./queries";
import { CaseHeader } from "./CaseHeader";
import { CaseTimeline } from "./CaseTimeline";
import { WeeklyHoursTable } from "./WeeklyHoursTable";
import SectionHeader from "@/components/SectionHeader";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function CasePage() {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_CASE_BY_SLUG, {
    variables: { slug },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const caseItem = data.case;
  const byKind = caseItem.timesheets?.lastSixWeeks?.byKind || {};

  // Generate last 6 weeks dates with start and end dates
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() - 7 * (6 - i));
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return {
      start: startDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      end: endDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    };
  });

  return (
    <div>
      <CaseHeader caseItem={caseItem} />

      {caseItem.updates && caseItem.updates.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Case Updates" subtitle="" />
          <div className="ml-4 mr-4">
            <CaseTimeline updates={caseItem.updates} />
          </div>
        </div>
      )}

      {caseItem.tracker && caseItem.tracker.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Tracking Projects" subtitle="" />
          <div className="ml-4 mr-4">
            <Table>
              <TableBody>
                {caseItem.tracker.map((track: { id: string; name: string }) => {
                  const projectWorkers =
                    caseItem.timesheets.lastSixWeeks.byCase[0].workersByTrackingProject?.find(
                      (project: { projectId: string }) =>
                        project.projectId === track.id
                    )?.workers || [];

                  return (
                    <React.Fragment key={track.id}>
                      {projectWorkers.length > 0 ? (
                        <>
                          <TableRow>
                            <TableCell
                              rowSpan={projectWorkers.length}
                              className="w-1/2 break-words border-r"
                            >
                              {track.name}
                            </TableCell>
                            <TableCell className="w-1/2">{projectWorkers[0]}</TableCell>
                          </TableRow>
                          {projectWorkers.slice(1).map((worker: string) => (
                            <TableRow key={`${track.id}-${worker}`}>
                              <TableCell className="w-1/2">{worker}</TableCell>
                            </TableRow>
                          ))}
                        </>
                      ) : (
                        <TableRow>
                          <TableCell className="w-1/2 break-words border-r">
                            {track.name}
                          </TableCell>
                          <TableCell className="w-1/2 text-muted-foreground">
                            No team members
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {byKind.consulting?.byWorker?.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Consulting Hours" subtitle="" />
          <div className="ml-4 mr-4">
            <WeeklyHoursTable
              weeks={weeks}
              consultingWorkers={byKind.consulting.byWorker}
            />
          </div>
        </div>
      )}

      {byKind.handsOn?.byWorker?.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Hands-on Hours" subtitle="" />
          <div className="ml-4 mr-4">
            <WeeklyHoursTable
              weeks={weeks}
              consultingWorkers={byKind.handsOn.byWorker}
            />
          </div>
        </div>
      )}

      {byKind.squad?.byWorker?.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Squad Hours" subtitle="" />
          <div className="ml-4 mr-4">
            <WeeklyHoursTable
              weeks={weeks}
              consultingWorkers={byKind.squad.byWorker}
            />
          </div>
        </div>
      )}

      {byKind.internal?.byWorker?.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Internal Hours" subtitle="" />
          <div className="ml-4 mr-4">
            <WeeklyHoursTable
              weeks={weeks}
              consultingWorkers={byKind.internal.byWorker}
            />
          </div>
        </div>
      )}
    </div>
  );
}
