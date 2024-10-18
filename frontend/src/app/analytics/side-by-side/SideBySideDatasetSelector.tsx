import React from 'react';
import { useQuery } from "@apollo/client";
import Select from "react-tailwindcss-select";
import { GET_DATASETS } from '../datasets/datasetQueries';

interface SideBySideDatasetSelectorProps {
  selectedDataset: string | null;
  onDatasetSelect: (value: string) => void;
  filterKind?: string;
}

interface Dataset {
  slug: string;
  kind: string;
  name: string;
}

interface GroupedOption {
  label: string;
  options: { value: string; label: string }[];
}

const SideBySideDatasetSelector: React.FC<SideBySideDatasetSelectorProps> = ({ selectedDataset, onDatasetSelect, filterKind }) => {
  const { data: datasetsData, loading, error } = useQuery(GET_DATASETS);

  if (loading) return <div>Loading datasets...</div>;
  if (error) return <div>Error loading datasets: {error.message}</div>;

  const filteredDatasets = filterKind
    ? datasetsData?.datasets.filter((d: Dataset) => d.kind.startsWith(filterKind))
    : datasetsData?.datasets;

  const options: GroupedOption[] = filteredDatasets?.reduce(
    (acc: GroupedOption[], dataset: Dataset) => {
      const group = acc.find((g) => g.label === dataset.kind);
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
  ) || [];

  return (
    <div className="pl-2 pr-2 mb-6">
      <Select
        value={
          selectedDataset
            ? {
                value: selectedDataset,
                label: options.flatMap(g => g.options).find(o => o.value === selectedDataset)?.label || '',
              }
            : null
        }
        options={options}
        placeholder="Select a dataset"
        onChange={(value: any) =>
          onDatasetSelect(value ? value.value : '')
        }
        primaryColor={""}
        isMultiple={false}
        isSearchable={true}
        isClearable={false}
        formatGroupLabel={(data) => (
          <div className={`py-2 text-xs flex items-center justify-between`}>
            <span className="font-bold uppercase">{data.label}</span>
            <span className="bg-gray-200 h-5 w-5 p-1.5 flex items-center justify-center rounded-full">
              {data.options.length}
            </span>
          </div>
        )}
      />
    </div>
  );
};

export default SideBySideDatasetSelector;
