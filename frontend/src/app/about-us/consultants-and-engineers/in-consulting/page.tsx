"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { DatePicker } from "@/components/DatePicker";
import { REVENUE_FORECAST_QUERY } from "@/app/financial/revenue-forecast/query";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
import { ConsultingTableByConsultant } from "@/app/financial/revenue-forecast/ConsultingTableByConsultant";
import { processForecastData } from "@/app/financial/revenue-forecast/forecastData";

export default function ConsultantsAllocationPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);
  const [sortConfig, setSortConfig] = useState<Record<string, { key: string; direction: "asc" | "desc" }>>({
    "consultants-allocation": { key: "inAnalysisConsultingHours", direction: "desc" }
  });
  const [normalized, setNormalized] = useState<Record<string, boolean>>({
    "consultants-allocation": false
  });

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.forecast?.filterableFields?.reduce((acc: any[], field: any) => {
        const fieldValues = newSelectedValues
          .filter((v) => typeof v.value === "string" && v.value.startsWith(`${field.field}:`))
          .map((v) => (v.value as string).split(":")[1]);

        if (fieldValues.length > 0) {
          acc.push({
            field: field.field,
            selectedValues: fieldValues,
          });
        }
        return acc;
      }, []) || [];

    setFormattedSelectedValues(formattedValues);
  };

  const { loading, error, data } = useQuery(REVENUE_FORECAST_QUERY, {
    variables: {
      dateOfInterest: format(date, "yyyy-MM-dd"),
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
  });

  const requestSort = (key: string) => {
    setSortConfig((prev) => ({
      "consultants-allocation": {
        key,
        direction: prev["consultants-allocation"].key === key && prev["consultants-allocation"].direction === "desc" ? "asc" : "desc"
      }
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.forecast?.dates) return <div>No data available</div>;

  const forecastData = processForecastData(data);

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center">
          <DatePicker date={date} onSelectedDateChange={setDate} />
          <div className="flex-grow h-px bg-gray-200 ml-2"></div>
        </div>

        <FilterFieldsSelect
          data={data?.forecast}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>

      <ConsultingTableByConsultant 
        title="Consultants Allocation"
        tableData={{
          consultants: forecastData.consulting.consultants,
          totals: forecastData.consulting.totals
        }}
        tableId="consultants-allocation"
        dates={data.forecast.dates}
        workingDays={data.forecast.workingDays}
        sortConfigs={sortConfig}
        normalized={normalized}
        requestSort={(key) => requestSort(key)}
        setNormalized={setNormalized}
      />
    </div>
  );
}
