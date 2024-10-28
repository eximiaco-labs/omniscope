"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_CLIENT_BY_SLUG } from "./queries";
import { ClientHeader } from "./ClientHeader";
import { WeeklyHoursTable } from "./WeeklyHoursTable";

export default function ClientPage() {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_CLIENT_BY_SLUG, {
    variables: { slug },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const client = data.client;
  const byKind = client.timesheets?.lastSixWeeks?.byKind || {};
  
  // Generate last 6 weeks dates with start and end dates
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() - 7 * (6 - i));
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return {
      start: startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      end: endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };
  });

  return (
    <div>
      <ClientHeader client={client} />
      
      {byKind.consulting?.byWorker?.length > 0 && (
        <>
          <h3 className="mt-8 mb-4 text-lg font-semibold">Consulting Hours</h3>
          <WeeklyHoursTable weeks={weeks} workers={byKind.consulting.byWorker} />
        </>
      )}

      {byKind.handsOn?.byWorker?.length > 0 && (
        <>
          <h3 className="mt-8 mb-4 text-lg font-semibold">Hands-on Hours</h3>
          <WeeklyHoursTable weeks={weeks} workers={byKind.handsOn.byWorker} />
        </>
      )}

      {byKind.squad?.byWorker?.length > 0 && (
        <>
          <h3 className="mt-8 mb-4 text-lg font-semibold">Squad Hours</h3>
          <WeeklyHoursTable weeks={weeks} workers={byKind.squad.byWorker} />
        </>
      )}

      {byKind.internal?.byWorker?.length > 0 && (
        <>
          <h3 className="mt-8 mb-4 text-lg font-semibold">Internal Hours</h3>
          <WeeklyHoursTable weeks={weeks} workers={byKind.internal.byWorker} />
        </>
      )}
    </div>
  );
}
