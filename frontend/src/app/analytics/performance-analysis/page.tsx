"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { PERFORMANCE_ANALYSIS_QUERY } from "./query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";

export default function PerformanceAnalysisPage() {
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const defaultDate = format(date.setDate(1), "yyyy-MM-dd");

  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: defaultDate },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {data.performanceAnalysis.weeks.map((week: any) => {
          const isWeekDisabled = new Date(week.start) > date;
          
          return (
            <Card 
              key={week.start} 
              className={`h-fit ${isWeekDisabled ? 'opacity-50' : ''}`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">
                  {format(new Date(week.start), "MMMM d")} - {format(new Date(week.end), "d, yyyy")}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs font-semibold text-gray-600 block mb-2">Regular</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">{week.totals.regular.actualWorkHours}h</span>
                      <span className="text-xs text-gray-500">/ {week.totals.regular.approvedWorkHours}h</span>
                    </div>
                    {week.totals.regular.actualWorkHours !== week.totals.regular.inContextActualWorkHours && (
                      <div className="text-xs text-gray-500 mt-1">
                        {week.totals.regular.inContextActualWorkHours} in {format(date, 'MMMM')}
                      </div>
                    )}
                    {week.totals.regular.wastedHours > 0 && (
                      <Badge color="red" className="mt-2">
                        {week.totals.regular.wastedHours}h wasted
                      </Badge>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs font-semibold text-gray-600 block mb-2">Pre-Contracted</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">{week.totals.preContracted.actualWorkHours}h</span>
                      <span className="text-xs text-gray-500">/ {week.totals.preContracted.approvedWorkHours}h</span>
                    </div>
                    {week.totals.preContracted.actualWorkHours !== week.totals.preContracted.inContextActualWorkHours && (
                      <div className="text-xs text-gray-500 mt-1">
                        {week.totals.preContracted.inContextActualWorkHours} in {format(date, 'MMMM')}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {week.totals.preContracted.possibleUnpaidHours > 0 && (
                        <Badge color="orange">
                          {week.totals.preContracted.possibleUnpaidHours}h unpaid
                        </Badge>
                      )}
                      {week.totals.preContracted.possibleIdleHours > 0 && (
                        <Badge color="yellow">
                          {week.totals.preContracted.possibleIdleHours}h idle
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
