import React from 'react';
import { TotalWorkingHours } from "@/app/components/analytics/TotalWorkingHours";
import { ByClient } from "@/app/components/analytics/ByClient";
import { ByWorker } from "@/app/components/analytics/ByWorker";
import { ByWorkingDay } from "@/app/components/analytics/ByWorkingDay";
import { BySponsor } from "@/app/components/analytics/BySponsor";
import { ByAccountManager } from "@/app/components/analytics/ByAccountManager";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";

interface TimesheetDataProps {
  filteredData: any;
  selectedValues: SelectValue[];
  setSelectedValues: React.Dispatch<React.SetStateAction<SelectValue[]>>;
  updateQueryString: (newSelectedValues: SelectValue[]) => void;
  setFormattedSelectedValues: React.Dispatch<React.SetStateAction<Array<{field: string, selectedValues: string[]}>>>;
}

const TimesheetData: React.FC<TimesheetDataProps> = ({
  filteredData,
  selectedValues,
  setSelectedValues,
  updateQueryString,
  setFormattedSelectedValues
}) => {
  if (!filteredData || !filteredData.timesheet) {
    return null;
  }

  return (
    <>
      {filteredData.timesheet.filterableFields && (
        <div className="mb-6">
          <form className="pl-2 pr-2">
            <Select
              value={selectedValues}
              options={filteredData.timesheet.filterableFields.map((f: any) => ({
                label: String(f.field ?? 'Unknown Field'),
                options: (f.options || [])
                  .filter((o: any) => o != null)
                  .map((o: any) => ({
                    value: `${f.field}:${String(o)}`,
                    label: String(o),
                  }))
              }))}
              placeholder="Filters..."
              onChange={(value): void => {
                const newSelectedValues = Array.isArray(value) ? value : [];
                setSelectedValues(newSelectedValues);
                updateQueryString(newSelectedValues);
                
                const formattedValues = filteredData.timesheet.filterableFields.reduce((acc: any[], field: any) => {
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
              }}
              primaryColor={""}
              isMultiple={true}
              isSearchable={true}
              isClearable={true}
              formatGroupLabel={(data) => (
                <div className={`py-2 text-xs flex items-center justify-between`}>
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
        timesheet={filteredData.timesheet}
        className="mb-6"
      />
      <ByClient timesheet={filteredData.timesheet} className="mb-6" />
      <ByAccountManager timesheet={filteredData.timesheet} className="mb-6" />
      <ByWorker timesheet={filteredData.timesheet} className="mb-6" />
      <BySponsor timesheet={filteredData.timesheet} className="mb-6" />
      <ByWorkingDay timesheet={filteredData.timesheet} />
    </>
  );
};

export default TimesheetData;
