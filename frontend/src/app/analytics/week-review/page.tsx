"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export default function WeekReview() {
  const [date, setDate] = useState<Date>(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const handleDayClick = (clickedDate: Date) => {
    setDate(clickedDate);
  };

  const weekStart = startOfWeek(date);

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

      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const currentDate = addDays(weekStart, index);
          const isFutureDate = isAfter(currentDate, date);
          return (
            <Card
              key={day}
              className={`cursor-pointer transition-all duration-300 ${
                isSameDay(currentDate, date) ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
              } ${isFutureDate ? 'opacity-50' : ''}`}
              onClick={() => handleDayClick(currentDate)}
            >
              <CardHeader>
                <CardTitle className="text-sm">
                  <span className="font-bold">{day}</span>
                  <span className="text-xs text-gray-600 ml-2">{format(currentDate, 'MMM d')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Content can be added here if needed */}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
