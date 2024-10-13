"use client";

import { useQuery, useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { TotalWorkingHours } from "@/app/components/analytics/TotalWorkingHours";
import { ByClient } from "@/app/components/analytics/ByClient";
import { ByWorker } from "@/app/components/analytics/ByWorker";
import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import Select from "react-tailwindcss-select";
import { ByWorkingDay } from "@/app/components/analytics/ByWorkingDay";
import { BySponsor } from "@/app/components/analytics/BySponsor";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { useRouter, useParams, useSearchParams } from 'next/navigation';

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
  query GetTimesheet($slug: String!, $filters: [FilterInput]) {
    timesheet(slug: $slug, filters: $filters) {
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
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const defaultDataset = 'timesheet-this-month';
  const [selectedDataset, setSelectedDataset] = useState(
    params.slug && params.slug.length > 0 ? params.slug[0] : defaultDataset
  );
  const [selectedValues, setSelectedValues] = useState<SelectValue[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<Array<{field: string, selectedValues: string[]}>>([]);

  useEffect(() => {
    if (selectedDataset) {
      const queryString = new URLSearchParams(searchParams).toString();
      router.push(`/analytics/datasets/${selectedDataset}${queryString ? `?${queryString}` : ''}`);
    } else {
      router.push(`/analytics/datasets`);
    }
  }, [selectedDataset, router, searchParams]);

  useEffect(() => {
    const filters = parseFiltersFromSearchParams(searchParams);
    setFormattedSelectedValues((prev) => {
      const prevFiltersString = JSON.stringify(prev);
      const newFiltersString = JSON.stringify(filters);
      return prevFiltersString !== newFiltersString ? filters : prev;
    });

    const newSelectedValues = filters.flatMap(filter => 
      filter.selectedValues.map(value => ({
        value: `${filter.field}:${value}`,
        label: value
      }))
    );
    setSelectedValues(newSelectedValues);
  }, [searchParams]);

  const [getFilteredTimesheet, { loading: filterLoading, error: filterError, data: filteredData }] = useLazyQuery(GET_TIMESHEET);

  const { loading, error, data } = useQuery(GET_TIMESHEET, {
    variables: { 
      slug: selectedDataset,
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null
    },
    skip: !selectedDataset,
  });

  useEffect(() => {
    if (selectedDataset) {
      const filters = formattedSelectedValues.length > 0 ? formattedSelectedValues : null;
      getFilteredTimesheet({
        variables: {
          slug: selectedDataset,
          filters: filters
        }
      });
    }
  }, [formattedSelectedValues, selectedDataset, getFilteredTimesheet]);

  // Adicione este useEffect para carregar os dados iniciais com os filtros da URL
  useEffect(() => {
    if (selectedDataset) {
      const initialFilters = Array.from(searchParams.entries()).map(([field, value]) => ({
        field,
        selectedValues: [value]
      }));
      getFilteredTimesheet({
        variables: {
          slug: selectedDataset,
          filters: initialFilters.length > 0 ? initialFilters : null
        }
      });
    }
  }, []);

  const timesheetData = filteredData || data;

  const updateQueryString = (newSelectedValues: SelectValue[]) => {
    const params = new URLSearchParams(searchParams);
    params.delete('field'); // Remova os antigos
    newSelectedValues.forEach(value => {
      if (typeof value.value === 'string') {
        const [field, fieldValue] = value.value.split(':');
        params.append(field, fieldValue);
      }
    });
    router.push(`/analytics/datasets/${selectedDataset}?${params.toString()}`);
  };

  function parseFiltersFromSearchParams(searchParams: URLSearchParams): Array<{ field: string; selectedValues: string[] }> {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (!filters[key]) filters[key] = [];
      filters[key].push(value);
    });
    return Object.entries(filters).map(([field, selectedValues]) => ({ field, selectedValues }));
  }

  return (
    <>
      <DatasetsList
        onDatasetSelect={setSelectedDataset}
        selectedDataset={selectedDataset}
      />
      {selectedDataset && (
        <>
          {(loading || filterLoading) && <p className="text-center py-5">Loading...</p>}
          {(error || filterError) && (
            <p className="text-center py-5 text-red-500">
              Error: {(error || filterError)?.message}
            </p>
          )}
          {timesheetData && (
            <>
              {timesheetData.timesheet.filterableFields && (
                <div className="mb-6">
                  <form className="pl-2 pr-2">
                    <Select
                      value={selectedValues}
                      options={timesheetData.timesheet.filterableFields.map((f: any) => {
                        const options = (f.options || [])
                          .filter((o: any) => o != null)
                          .map((o: any) => ({
                            value: `${f.field}:${String(o)}`,
                            label: String(o),
                          }));
                        return {
                          label: String(f.field ?? 'Unknown Field'),
                          options: options,
                        };
                      })}
                      placeholder="Filters..."
                      onChange={(value: SelectValue | SelectValue[]): void => {
                        const newSelectedValues = Array.isArray(value) ? value : [];
                        setSelectedValues(newSelectedValues);
                        updateQueryString(newSelectedValues);
                        
                        // Create the formatted structure
                        const formattedValues = timesheetData.timesheet.filterableFields.reduce((acc: any[], field: any) => {
                          const fieldValues = newSelectedValues
                            .filter(v => typeof v.value === 'string' && v.value.startsWith(`${field.field}:`))
                            .map(v => (v.value as string).split(':')[1]);
                          
                          if (fieldValues.length > 0) {
                            acc.push({
                              field: field.field,
                              selectedValues: fieldValues
                            });
                          }
                          return acc;
                        }, []);
                        
                        setFormattedSelectedValues(formattedValues);
                        // Remova ou comente a linha abaixo
                        // console.log("Formatted selected values:", formattedValues);
                      }}
                      primaryColor={""}
                      isMultiple={true}
                      isSearchable={true}
                      isClearable={true}
                      formatGroupLabel={(data) => (
                        <div
                          className={`py-2 text-xs flex items-center justify-between`}
                        >
                          <span className="font-bold uppercase">
                            {data.label
                              .replace(/([A-Z])/g, ' $1')
                              .trim()
                              .replace(/(Name|Title)$/, '')}
                          </span>
                          <span className="bg-gray-200 h-5 h-5 p-1.5 flex items-center justify-center rounded-full">
                            {data.options.length}
                          </span>
                        </div>
                      )}
                    />
                  </form>
                </div>
              )}
              <TotalWorkingHours
                timesheet={timesheetData.timesheet}
                className="mb-6"
              />
              <ByClient timesheet={timesheetData.timesheet} className="mb-6" />
              <ByWorker timesheet={timesheetData.timesheet} className="mb-6" />
              <BySponsor timesheet={timesheetData.timesheet} className="mb-6" />
              <ByWorkingDay timesheet={timesheetData.timesheet} />
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

function DatasetsList({
  onDatasetSelect,
  selectedDataset,
}: DatasetsListProps) {
  const { loading, error, data } = useQuery(GET_DATASETS);

  if (loading) return <p>Loading datasets...</p>;
  if (error)
    return <p>Error loading datasets: {error.message}</p>;

  return (
    <div className="mb-3">
      <Heading>Available Datasets</Heading>
      <Divider className="my-3" />
      <div className="pl-2 pr-2">
        <Select
          value={
            selectedDataset
              ? {
                  value: selectedDataset,
                  label:
                    data.datasets.find(
                      (d: any) => d.slug === selectedDataset
                    )?.name || '',
                }
              : null
          }
          options={data.datasets.reduce(
            (acc: any[], dataset: any) => {
              const group = acc.find(
                (g) => g.label === dataset.kind
              );
              if (group) {
                group.options.push({
                  value: dataset.slug,
                  label: dataset.name,
                });
              } else {
                acc.push({
                  label: dataset.kind,
                  options: [
                    {
                      value: dataset.slug,
                      label: dataset.name,
                    },
                  ],
                });
              }
              return acc;
            },
            []
          )}
          placeholder="Select a dataset"
          onChange={(value: any) =>
            onDatasetSelect(value ? value.value : '')
          }
          primaryColor={""}
          isMultiple={false}
          isSearchable={true}
          isClearable={false}
          formatGroupLabel={(data) => (
            <div
              className={`py-2 text-xs flex items-center justify-between`}
            >
              <span className="font-bold uppercase">
                {data.label}
              </span>
              <span className="bg-gray-200 h-5 h-5 p-1.5 flex items-center justify-center rounded-full">
                {data.options.length}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
}