"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { TotalWorkingHours } from "@/app/components/analytics/TotalWorkingHours";
import { ByClient } from "@/app/components/analytics/ByClient";

const GET_TIMESHEET = gql`
  query GetTimesheet($slug: String!) {
    timesheet(slug: $slug) {
      totalHours
      totalConsultingHours
      totalSquadHours
      totalInternalHours
      uniqueClients
      averageHoursPerClient
      stdDevHoursPerClient
      byClient {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
      }
      uniqueWorkers
      uniqueCases
    }
  }
`;

export default function Datasets() {
  const { loading, error, data } = useQuery(GET_TIMESHEET, {
    variables: { slug: "timesheet-last-six-weeks" },
  });

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error)
    return (
      <p className="text-center py-5 text-red-500">Error: {error.message}</p>
    );

  const { timesheet } = data;

  return (
    <>
      <TotalWorkingHours timesheet={timesheet} className="mb-6"/>
      <ByClient timesheet={timesheet} />
    </>
  );
}