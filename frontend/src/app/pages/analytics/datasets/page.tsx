"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { TotalWorkingHours } from "@/app/components/analytics/TotalWorkingHours";
import { ByClient } from "@/app/components/analytics/ByClient";
import { ByWorker } from "@/app/components/analytics/ByWorker";
import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import { Select as CatalystSelect } from "@/components/catalyst/select";
import Select from "react-tailwindcss-select";
import { ByWorkingDay } from "@/app/components/analytics/ByWorkingDay";
import { BySponsor } from "@/app/components/analytics/BySponsor";
import { ByAccountManager } from "@/app/components/analytics/ByAccountManager";

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
      totalHandsOnHours
      
      byKind {
        consulting {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
        }
        
        squad {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
        }
        
        handsOn {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
        }
        
        internal {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
        }
      }
      
      uniqueClients

      byClient {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }

      uniqueWorkers

      byWorker {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }

      bySponsor {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }
      uniqueSponsors

      byAccountManager {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }
      uniqueAccountManagers
      
      byDate {
        date
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }
      uniqueWorkingDays

      filterableFields {
        field,
        selectedValues,
        options
      }
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
              {data && data.timesheet && data.timesheet.filterableFields && (
                <div className="mb-6">
                  <Heading>Filter Data</Heading>
                  <Divider className="my-3" />
                  <form className="pl-2 pr-2">
                    {data.timesheet.filterableFields.map((field: FilterableField) => (
                      <div key={field.field} className="mb-4">
                        <Select
                          value={field.selectedValues.map((value: string) => ({ value, label: value }))}
                          options={field.options.map((option: string) => ({ value: option, label: option }))}
                          placeholder={field.field}
                          onChange={(selectedOptions) => {
                            // const selectedValues = selectedOptions ? selectedOptions.map((option: { value: string; }) => option.value) : [];
                            // console.log(`${field.field} changed:`, selectedValues);
                          } } primaryColor={""}                        
                        />
                      </div>
                    ))}
                  </form>
                </div>
              )}
              <TotalWorkingHours timesheet={data.timesheet} className="mb-6" />
              <ByClient timesheet={data.timesheet} className="mb-6" />
              <ByWorker timesheet={data.timesheet} className="mb-6" />
              <BySponsor timesheet={data.timesheet} className="mb-6" />
              <ByWorkingDay timesheet={data.timesheet} />
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
        <CatalystSelect
          onChange={(e) => onDatasetSelect(e.target.value)}
          value={selectedDataset}
        >
          <option value="">Select a dataset</option>
          {data.datasets.map((dataset: { slug: string; name: string }) => (
            <option key={dataset.slug} value={dataset.slug}>
              {dataset.name}
            </option>
          ))}
        </CatalystSelect>
      </div>
    </div>
  );
}
