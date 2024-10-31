"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GET_CLIENT_BY_SLUG, GET_CLIENT_TIMESHEET } from "./queries";
import { ClientHeader } from "./ClientHeader";
import TopWorkers from "@/app/components/panels/TopWorkers";
import TopSponsors from "@/app/components/panels/TopSponsors";
import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";

export default function ClientPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDataset, setSelectedDataset] = useState<string>("last-six-weeks");
  const [selectedStat, setSelectedStat] = useState("total");

  const { data: clientData, loading: clientLoading, error: clientError } = useQuery(GET_CLIENT_BY_SLUG, {
    variables: { slug },
  });

  const { data: timesheetData, loading: timesheetLoading, error: timesheetError } = useQuery(GET_CLIENT_TIMESHEET, {
    variables: { 
      clientName: clientData?.client?.name,
      datasetSlug: selectedDataset
    },
    skip: !selectedDataset || !clientData?.client?.name
  });

  useEffect(() => {
    const datasetParam = searchParams.get('dataset');
    if (datasetParam) {
      setSelectedDataset(datasetParam);
    }
  }, [searchParams]);

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    router.push(`/about-us/clients/${slug}?dataset=${value}`);
  };

  if (clientLoading) return <p>Loading client data...</p>;
  if (clientError) return <p>Error loading client: {clientError.message}</p>;

  const timesheet = timesheetData?.timesheet;

  return (
    <div>
      <ClientHeader client={clientData?.client} />
      
      <div className="mt-6 mb-6">
        <DatasetSelector
          selectedDataset={selectedDataset}
          onDatasetSelect={handleDatasetSelect}
        />
      </div>

      {timesheetLoading ? (
        <p>Loading timesheet data...</p>
      ) : timesheetError ? (
        <p>Error loading timesheet: {timesheetError.message}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopWorkers 
            workerData={timesheet?.byWorker || []}
            selectedStat={selectedStat}
            totalHours={timesheet?.totalHours || 0}
          />
          <TopSponsors 
            sponsorData={timesheet?.bySponsor || []}
            selectedStat={selectedStat}
            totalHours={timesheet?.totalHours || 0}
          />
        </div>
      )}
    </div>
  );
}
