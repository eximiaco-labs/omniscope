"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { addDays, format, startOfWeek, isSameDay, isAfter } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const renderMonthHoursComparison = (data: any) => {
    const hoursPreviousMonth =
      data?.weekReview?.monthSummary?.hoursPreviousMonth || 10;
    const hoursThisMonth = data?.weekReview?.monthSummary?.hoursThisMonth || 5;
    const targetHours = Math.max(hoursPreviousMonth * 1.1, hoursThisMonth);
    const hoursPreviousMonthUntilThisDate =
      data?.weekReview?.monthSummary?.hoursPreviousMonthUntilThisDate || 0;

    return (
      <motion.div
        className="col-span-2 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        {/* Header */}
        <motion.div
          className="p-2 border-b border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm font-bold">Monthly Hours Comparison</div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="p-4 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-full h-[150px]">
            <GaugeComponent
              id="month-hours-gauge"
              value={hoursThisMonth}
              maxValue={targetHours}
              type="radial"
              marginInPercent={{
                top: 0,
                left: 0.3,
                bottom: 0,
                right: 0.3,
              }}
              arc={{
                padding: 0.02,
                width: 0.3,
                subArcs: [
                  {
                    limit: hoursPreviousMonthUntilThisDate,
                    color: "#B22222",
                  },
                  {
                    limit: hoursPreviousMonth,
                    color: "#B77A00",
                  },
                  {
                    limit: targetHours,
                    color: "#228B22",
                  },
                ],
              }}
              pointer={{
                type: "arrow",
                color: "#345243",
                length: 0.8,
                width: 15,
              }}
              labels={{
                valueLabel: { hide: true },
                tickLabels: { hideMinMax: true },
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-black">
                {hoursThisMonth.toFixed(1)}h
              </span>
              <span
                className={`text-xs ${
                  hoursThisMonth > hoursPreviousMonthUntilThisDate
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {hoursThisMonth > hoursPreviousMonthUntilThisDate ? "▲" : "▼"}
                {Math.abs(
                  ((hoursThisMonth - hoursPreviousMonthUntilThisDate) /
                    (hoursPreviousMonthUntilThisDate || 1)) *
                    100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="flex justify-between text-xs px-4 py-2 bg-gray-50 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div style={{ color: "#B22222" }}>
            <span>Previous Month (Same Date)</span>
            <br />
            <span className="font-bold">
              {hoursPreviousMonthUntilThisDate.toFixed(1)}h
            </span>
          </div>
          <div style={{ color: "#B77A00" }} className="text-right">
            <span>Previous Month (Total)</span>
            <br />
            <span className="font-bold">{hoursPreviousMonth.toFixed(1)}h</span>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderWeekHoursComparison = (data: any) => {
    const hoursPreviousWeeks =
      data?.weekReview?.hoursPreviousWeeks || 10;
    const hoursThisWeek = data?.weekReview?.hoursThisWeek || 5;
    const targetHours = Math.max(hoursPreviousWeeks * 1.1, hoursThisWeek);
    const hoursPreviousWeeksUntilThisDate =
      data?.weekReview?.hoursPreviousWeeksUntilThisDate || 0;

    return (
      <motion.div
        className="col-span-2 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        {/* Header */}
        <motion.div
          className="p-2 border-b border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm font-bold">Weekly Hours Comparison</div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="p-4 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-full h-[150px]">
            <GaugeComponent
              id="week-hours-gauge"
              value={hoursThisWeek}
              maxValue={targetHours}
              type="radial"
              marginInPercent={{
                top: 0,
                left: 0.3,
                bottom: 0,
                right: 0.3,
              }}
              arc={{
                padding: 0.02,
                width: 0.3,
                subArcs: [
                  {
                    limit: hoursPreviousWeeksUntilThisDate,
                    color: "#B22222",
                  },
                  {
                    limit: hoursPreviousWeeks,
                    color: "#B77A00",
                  },
                  {
                    limit: targetHours,
                    color: "#228B22",
                  },
                ],
              }}
              pointer={{
                type: "arrow",
                color: "#345243",
                length: 0.8,
                width: 15,
              }}
              labels={{
                valueLabel: { hide: true },
                tickLabels: { hideMinMax: true },
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-black">
                {hoursThisWeek.toFixed(1)}h
              </span>
              <span
                className={`text-xs ${
                  hoursThisWeek > hoursPreviousWeeksUntilThisDate
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {hoursThisWeek > hoursPreviousWeeksUntilThisDate ? "▲" : "▼"}
                {Math.abs(
                  ((hoursThisWeek - hoursPreviousWeeksUntilThisDate) /
                    (hoursPreviousWeeksUntilThisDate || 1)) *
                    100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="flex justify-between text-xs px-4 py-2 bg-gray-50 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div style={{ color: "#B22222" }}>
            <span>Previous Weeks (Same Date)</span>
            <br />
            <span className="font-bold">
              {hoursPreviousWeeksUntilThisDate.toFixed(1)}h
            </span>
          </div>
          <div style={{ color: "#B77A00" }} className="text-right">
            <span>Previous Weeks (Total)</span>
            <br />
            <span className="font-bold">{hoursPreviousWeeks.toFixed(1)}h</span>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <Heading>Week Review</Heading>

      <div className="mt-3 mb-3 flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
            <Select
              onValueChange={(value) =>
                setDate(addDays(new Date(), parseInt(value)))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="0">Today</SelectItem>
                <SelectItem value="1">Tomorrow</SelectItem>
                <SelectItem value="3">In 3 days</SelectItem>
                <SelectItem value="7">In a week</SelectItem>
              </SelectContent>
            </Select>
            <div className="rounded-md border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
              />
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <div className="mb-3">{renderFilterFieldsSelect(data)}</div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(renderWeekDayCard)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        <div className="col-span-2">{renderMonthHoursComparison(data)}</div>
        <div className="col-span-2">{renderWeekHoursComparison(data)}</div>
      </div>
    </>
  );
}
