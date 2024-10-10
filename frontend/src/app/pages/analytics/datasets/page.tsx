"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { TotalWorkingHours } from "@/app/components/analytics/TotalWorkingHours";
import { ByClient } from "@/app/components/analytics/ByClient";
import { ByWorker } from "@/app/components/analytics/ByWorker";
import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import { Select } from "@/components/catalyst/select";

const GET_DATASETS = gql`
  query GetDatasets {
    datasets {
      slug
      kind
      name
    }
  }
`;

const GET_TIMESHEET = gql`
  query GetTimesheet($slug: String!) {
    timesheet(slug: $slug) {
      totalHours
      totalConsultingHours
      totalSquadHours
      totalInternalHours
      
      byKind {
        consulting {
          uniqueClients
          uniqueWorkers
        }
        
        squad {
          uniqueClients
          uniqueWorkers
        }
        
        internal {
          uniqueClients
          uniqueWorkers
        }
      }
      
      uniqueClients

      byClient {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
      }

      uniqueWorkers

      byWorker {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
      }

      uniqueCases
    }
  }
`;

export default function Datasets() {
  const [selectedDataset, setSelectedDataset] = useState("");

  const { loading, error, data } = useQuery(GET_TIMESHEET, {
    variables: { slug: selectedDataset },
    skip: !selectedDataset,
  });

  return (
    <>
      <DatasetsList
        onDatasetSelect={setSelectedDataset}
        selectedDataset={selectedDataset}
      />
      {selectedDataset && (
        <>
          {loading && <p className="text-center py-5">Loading...</p>}
          {error && (
            <p className="text-center py-5 text-red-500">
              Error: {error.message}
            </p>
          )}
          {data && (
            <>
              <TotalWorkingHours timesheet={data.timesheet} className="mb-6" />
              <ByClient timesheet={data.timesheet} className="mb-6" />
              <ByWorker timesheet={data.timesheet} />
            </>
          )}
        </>
      )}
    </>
  );
}

interface DatasetsListProps {
  onDatasetSelect: (value: string) => void;
  selectedDataset: string;
}

function DatasetsList({ onDatasetSelect, selectedDataset }: DatasetsListProps) {
  const { loading, error, data } = useQuery(GET_DATASETS);

  if (loading) return <p>Loading datasets...</p>;
  if (error) return <p>Error loading datasets: {error.message}</p>;

  return (
    <div className="mb-6">
      <Heading>Available Datasets</Heading>
      <Divider className="my-3" />
      <div className="pl-3 pr-3">
        <Select
          onChange={(e) => onDatasetSelect(e.target.value)}
          value={selectedDataset}
        >
          <option value="">Select a dataset</option>
          {data.datasets.map((dataset: { slug: string; name: string }) => (
            <option key={dataset.slug} value={dataset.slug}>
              {dataset.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
