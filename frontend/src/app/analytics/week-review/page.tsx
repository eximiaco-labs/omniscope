"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { addDays, format, startOfWeek, isSameDay, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import {
  BarChart,
  Bar,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import SelectComponent from "react-tailwindcss-select";
import { SelectValue as TailwindSelectValue } from "react-tailwindcss-select/dist/components/type";
import { motion } from "framer-motion";

import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});

import { WEEK_REVIEW_QUERY } from "./weekReviewQuery";
import { DatePicker } from "@/components/DatePicker";
import { MonthComparisonPanel, WeekComparisonPanel } from './ComparisonPanels';

export default function WeekReview() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<TailwindSelectValue[]>(
    []
  );
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

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

  const weekStart = startOfWeek(date);

  const getMaxValue = () => {
    if (!data || !data.weekReview) return 0;
    let max = 0;
    Object.values(data.weekReview).forEach((day: any) => {
      if (day.dailySummary) {
        day.dailySummary.forEach((summary: any) => {
          const total =
            (summary.consulting || 0) +
            (summary.squad || 0) +
            (summary.handsOn || 0) +
            (summary.internal || 0);
          if (total > max) max = total;
        });
      }
    });
    return max;
  };

  const maxValue = getMaxValue();

  const handleFilterChange = (
    value: TailwindSelectValue | TailwindSelectValue[]
  ): void => {
    const newSelectedValues = Array.isArray(value) ? value : [];
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

  const renderFilterFieldsSelect = (data: any ) => {
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

  const renderWeekDayCard = (day: any, index: number) => {
    const currentDate = addDays(weekStart, index);
    const isDisabled = isAfter(currentDate, date);
    const dayData = data?.weekReview?.[day];
    const deltaPercentage =
      dayData?.totalHours && dayData?.averageHours
        ? ((dayData.totalHours - dayData.averageHours) / dayData.averageHours) *
          100
        : null;
    return (
      <motion.div
        key={day}
        className={cn(
          "cursor-pointer transition-all duration-300 border border-gray-200 bg-white",
          "rounded-sm shadow-sm overflow-hidden",
          isSameDay(currentDate, date)
            ? "ring-2 ring-black shadow-lg scale-105"
            : "hover:scale-102",
          isDisabled ? "opacity-30 grayscale contrast-75" : ""
        )}
        onClick={() => handleDayClick(currentDate)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className="p-2">
          <div className="text-sm">
            <span className="font-bold">
              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
            </span>
            <span className="text-xs text-gray-600 ml-2">
              {format(currentDate, "MMM d")}
            </span>
          </div>
        </div>
        <div className="px-2 py-1 cursor-pointer relative">
          {loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }
            }
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
          ) : dayData ? (
            <>
              <motion.div
                style={{ width: "100%", height: 100 }}
                className="cursor-pointer opacity-30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ResponsiveContainer>
                  <BarChart
                    data={dayData.dailySummary}
                    margin={{ left: 0, right: 0 }}
                  >
                    <Bar
                      dataKey="consulting"
                      stackId="a"
                      fill="#F59E0B"
                      isAnimationActive={false}
                      barSize={30}
                    />
                    <Bar
                      dataKey="handsOn"
                      stackId="a"
                      fill="#8B5CF6"
                      isAnimationActive={false}
                      barSize={30}
                    />
                    <Bar
                      dataKey="squad"
                      stackId="a"
                      fill="#3B82F6"
                      isAnimationActive={false}
                      barSize={30}
                    />
                    <Bar
                      dataKey="internal"
                      stackId="a"
                      fill="#10B981"
                      isAnimationActive={false}
                      barSize={30}
                    />
                    <YAxis domain={[0, maxValue]} hide />
                    <ReferenceLine
                      y={dayData.averageHours}
                      stroke="red"
                      strokeDasharray="3 3"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="text-2xl font-bold text-black">
                  {dayData.totalHours
                    ? dayData.totalHours % 1 === 0
                      ? Math.floor(dayData.totalHours)
                      : dayData.totalHours.toFixed(1)
                    : "-"}
                </span>
                {deltaPercentage !== null && (
                  <span
                    className={`text-xs ${
                      deltaPercentage > 0 ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {deltaPercentage > 0 ? "▲" : "▼"}{" "}
                    {Math.abs(deltaPercentage).toFixed(1)}%
                  </span>
                )}
              </motion.div>
            </>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No data available
            </motion.p>
          )}
        </div>
        <motion.div
          className="flex justify-between text-[9px] px-2 py-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="text-red-700">
            <span className="text-red-700">
              {dayData?.worstDay
                ? format(new Date(dayData.worstDay), "MMM d")
                : "-"}
            </span>
            <br />
            {dayData?.worstDayHours
              ? dayData.worstDayHours % 1 === 0
                ? Math.floor(dayData.worstDayHours)
                : dayData.worstDayHours.toFixed(1)
              : "-"}
          </span>
          <span className="text-blue-700">
            {dayData?.averageHours
              ? dayData.averageHours % 1 === 0
                ? Math.floor(dayData.averageHours)
                : dayData.averageHours.toFixed(1)
              : "-"}
          </span>
          <span className="text-green-700 text-right">
            <span className="text-green-700">
              {dayData?.bestDay
                ? format(new Date(dayData.bestDay), "MMM d")
                : "-"}
            </span>
            <br />
            {dayData?.bestDayHours
              ? dayData.bestDayHours % 1 === 0
                ? Math.floor(dayData.bestDayHours)
                : dayData.bestDayHours.toFixed(1)
              : "-"}
          </span>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <Heading>Week Review</Heading>

      <div className="mt-3 mb-3 flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <div className="mb-3">{renderFilterFieldsSelect(data)}</div>

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
          <div className="grid grid-cols-7 gap-2">
            {days.map(renderWeekDayCard)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-2">
              <MonthComparisonPanel data={data} />
            </div>
            <div className="col-span-2">
              <WeekComparisonPanel data={data} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
