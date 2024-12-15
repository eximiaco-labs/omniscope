"use client"

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
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
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function DateRangePicker({ date, onDateRangeChange }: DateRangePickerProps) {
  const handlePresetChange = (value: string) => {
    const today = new Date();
    
    switch(value) {
      case "this-week": {
        const from = startOfWeek(today, { weekStartsOn: 0 }); // Changed to 0 for Sunday
        const to = endOfWeek(today, { weekStartsOn: 0 });
        onDateRangeChange({ from, to });
        break;
      }
      case "this-month": {
        const from = startOfMonth(today);
        const to = endOfMonth(today);
        onDateRangeChange({ from, to });
        break;
      }
      case "previous-week": {
        const lastWeek = subWeeks(today, 1);
        const from = startOfWeek(lastWeek, { weekStartsOn: 0 }); // Changed to 0 for Sunday
        const to = endOfWeek(lastWeek, { weekStartsOn: 0 });
        onDateRangeChange({ from, to });
        break;
      }
      case "previous-month": {
        const lastMonth = subMonths(today, 1);
        const from = startOfMonth(lastMonth);
        const to = endOfMonth(lastMonth);
        onDateRangeChange({ from, to });
        break;
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
        <Select onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="previous-week">Previous Week</SelectItem>
            <SelectItem value="previous-month">Previous Month</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
