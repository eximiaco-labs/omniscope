"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_CASE_BY_SLUG } from "./queries";
import { CaseHeader } from "./CaseHeader";
import { CaseUpdate } from "./CaseUpdate";

export default function CasePage() {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_CASE_BY_SLUG, {
    variables: { slug },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const caseItem = data.case;
  const consultingWorkers = caseItem.timesheets?.lastSixWeeks?.byKind?.consulting?.byWorker || [];
  const weeks = consultingWorkers[0]?.weeklyHours?.map((wh: { week: string }) => wh.week) || [];

  return (
    <div>
      <CaseHeader caseItem={caseItem} />
      {caseItem.lastUpdate && <CaseUpdate lastUpdate={caseItem.lastUpdate} />}
      
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Worker</th>
              {weeks.map((week: string) => (
                <th key={week} className="border border-gray-300 p-2">{week}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consultingWorkers.map((worker: { name: string, weeklyHours: Array<{ week: string, hours: number }> }) => (
              <tr key={worker.name}>
                <td className="border border-gray-300 p-2">{worker.name}</td>
                {weeks.map((week: string) => {
                  const hours = worker.weeklyHours.find((wh: { week: string, hours: number }) => wh.week === week)?.hours || 0;
                  return (
                    <td key={week} className="border border-gray-300 p-2 text-center">
                      {hours.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
