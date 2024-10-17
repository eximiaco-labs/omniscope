"use client";

import { useQuery, useLazyQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { GET_DATASETS, GET_TIMESHEET } from '../datasetQueries';
import TimesheetData from '../TimesheetData';

export default function Datasets() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const defaultDataset = 'timesheet-this-month';
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<SelectValue[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<Array<{field: string, selectedValues: string[]}>>([]);

  const { data: datasetsData } = useQuery(GET_DATASETS);

  const [getFilteredTimesheet, { loading: filterLoading, error: filterError, data: filteredData }] = useLazyQuery(GET_TIMESHEET);

  useEffect(() => {
    const slug = params.slug && params.slug.length > 0 ? params.slug[0] : defaultDataset;
    setSelectedDataset(slug);
  }, [params.slug]);

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
    setFormattedSelectedValues(filters);

    const newSelectedValues = filters.flatMap(filter => 
      filter.selectedValues.map(value => ({
        value: `${filter.field}:${value}`,
        label: value
      }))
    );
    setSelectedValues(newSelectedValues);
  }, [searchParams]);

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

  const updateQueryString = (newSelectedValues: SelectValue[]) => {
    const params = new URLSearchParams(searchParams);
    params.delete('field');
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

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    setSelectedValues([]);
    setFormattedSelectedValues([]);
  };

  return (
    <>
      <Heading>Available Datasets</Heading>
      <Divider className="my-3" />
      <div className="pl-2 pr-2 mb-6">
        <Select
          value={
            selectedDataset
              ? {
                  value: selectedDataset,
                  label:
                    datasetsData?.datasets.find(
                      (d: any) => d.slug === selectedDataset
                    )?.name || '',
                }
              : null
          }
          options={datasetsData?.datasets.reduce(
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
          ) || []}
          placeholder="Select a dataset"
          onChange={(value: any) =>
            handleDatasetSelect(value ? value.value : '')
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

      {selectedDataset && (
        <>
          {filterLoading && <p className="text-center py-5">Loading...</p>}
          {filterError && (
            <p className="text-center py-5 text-red-500">
              Error: {filterError.message}
            </p>
          )}
          {filteredData && filteredData.timesheet && (
            <TimesheetData
              filteredData={filteredData}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              updateQueryString={updateQueryString}
              setFormattedSelectedValues={setFormattedSelectedValues}
            />
          )}
        </>
      )}
    </>
  );
}
