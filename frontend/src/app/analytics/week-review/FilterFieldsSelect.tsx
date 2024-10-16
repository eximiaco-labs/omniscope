import React from 'react';
import SelectComponent from "react-tailwindcss-select";
import { SelectValue as TailwindSelectValue } from "react-tailwindcss-select/dist/components/type";

interface FilterFieldsSelectProps {
  data: any;
  selectedFilters: TailwindSelectValue[];
  handleFilterChange: (value: TailwindSelectValue | TailwindSelectValue[]) => void;
}

export const FilterFieldsSelect: React.FC<FilterFieldsSelectProps> = ({ data, selectedFilters, handleFilterChange }) => {
  return (
    <SelectComponent
      value={selectedFilters}
      options={
        data?.weekReview?.filterableFields?.map((f: any) => {
          const options = (f.options || [])
            .filter((o: any) => o != null)
            .map((o: any) => ({
              value: `${f.field}:${String(o)}`,
              label: String(o),
            }));
          return {
            label: String(f.field ?? "Unknown Field"),
            options: options,
          };
        }) || []
      }
      placeholder="Filters..."
      onChange={handleFilterChange}
      primaryColor={""}
      isMultiple={true}
      isSearchable={true}
      isClearable={true}
      formatGroupLabel={(data) => (
        <div className={`py-2 text-xs flex items-center justify-between`}>
          <span className="font-bold uppercase">
            {data.label
              .replace(/([A-Z])/g, " $1")
              .trim()
              .replace(/(Name|Title)$/, "")}
          </span>
          <span className="bg-gray-200 h-5 h-5 p-1.5 flex items-center justify-center rounded-full">
            {data.options.length}
          </span>
        </div>
      )}
    />
  );
};
