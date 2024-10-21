"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { format } from "date-fns";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { Option } from "react-tailwindcss-select/dist/components/type";

import { WEEK_REVIEW_QUERY } from "./weekReviewQuery";
import { DatePicker } from "@/components/DatePicker";
import { MonthComparisonPanel, WeekComparisonPanel } from './ComparisonPanels';
import { WeekDayCards } from './WeekDayCards';
import { FilterFieldsSelect } from './FilterFieldsSelect';
import TimelinessPanel from './TimelinessPanel';
import AllocationAnalysisTables from './AllocationAnalysisTables';

export default function WeekReview() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Option[]>(
    []
  );
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(WEEK_REVIEW_QUERY, {
    variables: {
      dateOfInterest: format(date, "yyyy-MM-dd"),
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
  });

  const handleDayClick = (clickedDate: Date) => {
    setDate(clickedDate);
  };

  const handleFilterChange = (
    value: Option | Option[] | null
  ): void => {
    const newSelectedValues = Array.isArray(value) ? value : value ? [value] : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.weekReview?.filterableFields?.reduce((acc: any[], field: any) => {
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

  return (
    <>
      <Heading>Week Review</Heading>

      <div className="mt-3 mb-3 flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <div className="mb-3">
        <FilterFieldsSelect
          data={data}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>

      {loading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.p>
      ) : error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Error: {error.message}
        </motion.p>
      ) : (
        <>
          <WeekDayCards data={data} date={date} handleDayClick={handleDayClick} />
          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-2">
              <MonthComparisonPanel data={data} />
            </div>
            <div className="col-span-2">
              <WeekComparisonPanel data={data} />
            </div>
            <div className="col-span-3">
              <TimelinessPanel data={data.timelinessReview} />
            </div>
          </div>
          <div className="mt-8">
            <AllocationAnalysisTables 
              byWorker={data.weekReview.allocationAnalysisByWorker}
              byClient={data.weekReview.allocationAnalysisByClient}
            />
          </div>
        </>
      )}
    </>
  );
}
