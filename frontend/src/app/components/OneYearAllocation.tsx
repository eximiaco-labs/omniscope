import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContributionProps {
  month?: number; // 1-12
  year?: number;
}

const OneYearAllocation: React.FC<ContributionProps> = ({
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear()
}) => {
  // Get start date (12 months ago from current month)
  const start_month = month === 1 ? month + 1 : ((month - 11) <= 0 ? month + 1 : month - 11);
  const start_year = ((month - 11) <= 0) ? year - 1 : year;

  // Generate data for each month
  const monthsData: {[key: string]: { date: Date; allocation: number }[][]} = {};
  
  for (let m = 0; m < 12; m++) {
    const currentMonth = ((start_month + m - 1) % 12) + 1;
    const currentYear = start_year + Math.floor((start_month + m - 1) / 12);
    
    // Get first and last day of month
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // Get first day of first week (may be in previous month)
    const firstWeekDay = new Date(firstDay);
    firstWeekDay.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Get last day of last week (may be in next month)
    const lastWeekDay = new Date(lastDay);
    lastWeekDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days: { date: Date; allocation: number }[] = [];
    let currentDate = new Date(firstWeekDay);
    
    while (currentDate <= lastWeekDay) {
      days.push({
        date: new Date(currentDate),
        allocation: Math.floor(Math.random() * 12) + 1
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group days into weeks
    const weeks: { date: Date; allocation: number }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    monthsData[`${currentYear}-${currentMonth}`] = weeks;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex overflow-x-auto w-fit">
      <div className="flex flex-col">
        <div className="h-4" /> {/* Reduced height spacer */}
        <div className="grid grid-cols-1">
          {weekdays.map((day, index) => (
            <div key={index} className="h-[14px] flex items-center">
              <span className="text-[8px] text-gray-500 pr-2">{day}</span>
            </div>
          ))}
        </div>
      </div>
      {Object.entries(monthsData).map(([monthKey, weeks], monthIndex) => {
        const [year, month] = monthKey.split('-').map(Number);
        
        return (
          <div key={monthKey} className="flex flex-col">
            <div className="h-4 flex items-center text-[8px] text-gray-500">
              {months[month - 1]}
            </div>
            <div className="grid grid-cols-1">
              {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => (
                <div key={dayOfWeek} className="flex">
                  {weeks.map((week, weekIndex) => {
                    const day = week[dayOfWeek];
                    if (!day) return <div key={weekIndex} className="w-[14px] h-[14px]" />;

                    // Only skip days from previous month if not in first column of last month
                    if (monthIndex === 0 && day.date.getMonth() !== month - 1 && weekIndex > 0) {
                      return <div key={weekIndex} className="w-[14px] h-[14px]" />;
                    }

                    // Skip days from next month in last month
                    if (monthIndex === 11 && day.date.getMonth() !== month - 1) {
                      return <div key={weekIndex} className="w-[14px] h-[14px]" />;
                    }

                    return (
                      <div key={weekIndex} className="w-[14px] h-[14px]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div 
                                className="w-[10px] h-[10px] rounded-sm m-[2px]"
                                style={{
                                  backgroundColor: `rgba(37, 99, 235, ${day.allocation / 12})`
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {day.date.toLocaleDateString()}: {day.allocation}h
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OneYearAllocation;
