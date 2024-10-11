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
import { SelectValue } from "react-tailwindcss-select/dist/components/type";

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
        field
        selectedValues
        options
      }
    }
  }
`;

export default function Datasets() {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedValues, setSelectedValues] = useState<SelectValue[]>([]);

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
                  <form className="pl-2 pr-2">
                    <Select
                      value={selectedValues}
                      options={data.timesheet.filterableFields.map((f) => {
                        const options = (f.options || [])
                          .filter((o) => o != null)
                          .map((o) => ({
                            value: String(o),
                            label: String(o),
                          }));
                        return {
                          label: String(f.field ?? 'Unknown Field'),
                          options: options,
                        };
                      })}
                      placeholder="Filters..."
                      onChange={(value: SelectValue): void => {
                        console.log("Selected values:", value);
                        setSelectedValues(value ?? []);
                      }}
                      primaryColor={""}
                      isMultiple={true}
                      isSearchable={true}
                      isClearable={true}
                      formatGroupLabel={data => (
                        <div className={`py-2 text-xs flex items-center justify-between`}>
                            <span className="font-bold uppercase">{data.label.replace(/([A-Z])/g, ' $1').trim().replace(/(Name|Title)$/, '')}</span>
                            <span className="bg-gray-200 h-5 h-5 p-1.5 flex items-center justify-center rounded-full">
                                {data.options.length}
                            </span>
                        </div>
                      )}
                    />
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
