"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import { useQuery, gql } from "@apollo/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WEEK_REVIEW_QUERY = gql`
  query WeekReview($dateOfInterest: Date!) {
    weekReview(date_of_interest: $dateOfInterest) {
      sunday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      monday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      tuesday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      wednesday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      thursday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      friday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      saturday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
    }
  }
`;

export default function WeekReview() {
  const [date, setDate] = useState<Date>(new Date());

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(WEEK_REVIEW_QUERY, {
    variables: { dateOfInterest: format(date, 'yyyy-MM-dd') },
  });

  const handleDayClick = (clickedDate: Date) => {
    setDate(clickedDate);
  };

  const weekStart = startOfWeek(date);

  const getMaxValue = () => {
    if (!data || !data.weekReview) return 0;
    let max = 0;
    Object.values(data.weekReview).forEach((day: any) => {
      console.log(day);
      if (day.dailySummary) {
        day.dailySummary.forEach((summary: any) => {
          const total = summary.consulting + summary.squad + summary.handsOn + summary.internal;
          if (total > max) max = total;
        });
      }
    });
    return max;
  };

  const maxValue = getMaxValue();

  return (
    <>
      <Heading>Week Review</Heading>
      
      <div className="mt-6 mb-4 flex items-center">
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
              <Calendar mode="single" selected={date} onSelect={(newDate) => newDate && setDate(newDate)} />
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const currentDate = addDays(weekStart, index);
          const isDisabled = isAfter(currentDate, date);
          const dayData = data?.weekReview?.[day];
          return (
            <div
              key={day}
              className={cn(
                "cursor-pointer transition-all duration-300 border border-gray-200 bg-white",
                "rounded-sm shadow-sm overflow-hidden",
                isSameDay(currentDate, date) ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102',
                isDisabled ? 'opacity-30 grayscale contrast-75' : ''
              )}
              onClick={() => handleDayClick(currentDate)}
            >
              <div className="p-2">
                <div className="text-sm">
                  <span className="font-bold">{day.charAt(0).toUpperCase() + day.slice(1, 3)}</span>
                  <span className="text-xs text-gray-600 ml-2">{format(currentDate, 'MMM d')}</span>
                </div>
              </div>
              <div className="px-2 py-1">
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p>Error: {error.message}</p>
                ) : dayData ? (
                  <div style={{ width: '100%', height: 100 }}>
                    <ResponsiveContainer>
                      <BarChart data={dayData.dailySummary} margin={{ left: 0, right: 0 }}>
                        <Bar dataKey="consulting" stackId="a" fill="#F59E0B" isAnimationActive={false} barSize={30} />
                        <Bar dataKey="handsOn" stackId="a" fill="#8B5CF6" isAnimationActive={false} barSize={30} />
                        <Bar dataKey="squad" stackId="a" fill="#3B82F6" isAnimationActive={false} barSize={30} />
                        <Bar dataKey="internal" stackId="a" fill="#10B981" isAnimationActive={false} barSize={30} />
                        <YAxis domain={[0, maxValue]} hide />
                        <ReferenceLine y={dayData.averageHours} stroke="red" strokeDasharray="3 3" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </div>
              <div className="flex justify-between text-[9px] px-2 py-1">
                <span className="text-red-700">
                  <span className="text-red-700">{dayData?.worstDay ? format(new Date(dayData.worstDay), 'MMM d') : '-'}</span>
                  <br />
                  {dayData?.worstDayHours ? dayData.worstDayHours.toFixed(1) : '-'}
                </span>
                <span className="text-blue-700">
                  {dayData?.averageHours ? dayData.averageHours.toFixed(1) : '-'}
                </span>
                <span className="text-green-700 text-right">
                  <span className="text-green-700">{dayData?.bestDay ? format(new Date(dayData.bestDay), 'MMM d') : '-'}</span>
                  <br />
                  {dayData?.bestDayHours ? dayData.bestDayHours.toFixed(1) : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
