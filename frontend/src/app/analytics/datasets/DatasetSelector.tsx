import React from 'react';
import { useQuery } from "@apollo/client";
import Select from "react-tailwindcss-select";
import { GET_DATASETS } from './datasetQueries';

interface DatasetSelectorProps {
  selectedDataset: string | null;
  onDatasetSelect: (value: string) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ selectedDataset, onDatasetSelect }) => {
  const { data: datasetsData } = useQuery(GET_DATASETS);

  return (
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
  );
};

export default DatasetSelector;
