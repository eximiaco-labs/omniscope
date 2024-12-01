"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { DatePicker } from "@/components/DatePicker";
import { FilterFieldsSelect } from '../../components/FilterFieldsSelect';
import { REVENUE_TRACKING_QUERY } from "./query";
import { PreContractedRevenue } from "./components/PreContractedRevenue";
import { RegularRevenue } from "./components/RegularRevenue";
import { Summaries } from "./components/Summaries";

export default function RevenuePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(REVENUE_TRACKING_QUERY, {
    variables: {
      date: format(date, "yyyy-MM-dd"),
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    }
  });

  const handleFilterChange = (
    value: Option | Option[] | null
  ): void => {
    const newSelectedValues = Array.isArray(value) ? value : value ? [value] : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.revenueTracking?.filterableFields?.reduce((acc: any[], field: any) => {
        const fieldValues = newSelectedValues
          .filter(
            (v) =>
              typeof v.value === "string" &&
              v.value.startsWith(`${field.field}:`)
          )
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <FilterFieldsSelect
        data={data?.revenueTracking}
        selectedFilters={selectedFilters}
        handleFilterChange={handleFilterChange}
      />
      
      <div className="ml-2 mr-2">
        <Summaries data={data} date={date} />
        <div className="mt-4">
          <RegularRevenue data={data} date={date} />
        </div>
        <div className="mt-4">
          <PreContractedRevenue data={data} date={date} />
        </div>
      </div>
    </div>
  );
}
