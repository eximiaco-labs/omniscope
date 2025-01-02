import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { STAT_COLORS } from '../constants/colors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContributionProps {
  month?: number;
  year?: number;
}

interface WeekInfo {
  key: string;
  label: string;
  date: Date;
  weekNumber: number;
}

interface DayCell {
  key: string;
  label: string;
  hours: number;
  fullDate: string;
}

interface DayRow {
  dayName: string;
  cells: DayCell[];
}

interface MonthGroup {
  month: string;
  startIndex: number;
  count: number;
}

interface DayHours {
  [key: string]: { // date as string
    consulting: number;
    handsOn: number;
    squad: number;
    internal: number;
  }
}

const ALLOCATION_QUERY = gql`
  query AllocationOfYear($startDate: Date!, $endDate: Date!, $filters: [FilterInput!]) {
    allocation(startDate: $startDate, endDate: $endDate, filters: $filters) {
      byKind {
        consulting {
          date
          hours
        }
        handsOn {
          date
          hours
        }
        squad {
          date
          hours
        }
        internal {
          date
          hours
        }
      }
    }
  }
`;

const OneYearAllocation: React.FC<ContributionProps> = ({ month, year }) => {
  const [selectedKind, setSelectedKind] = useState<string>('consulting');
  const currentDate = new Date();
  const specifiedMonth = month || currentDate.getMonth() + 1;
  const specifiedYear = year || currentDate.getFullYear();

  // Calculate end date (last day of specified month/year)
  const endDate = new Date(specifiedYear, specifiedMonth, 0);
  
  // Calculate start date (first day, 11 months before specified month/year)
  const startDate = new Date(specifiedYear, specifiedMonth - 12, 1);

  const { loading, error, data } = useQuery(ALLOCATION_QUERY, {
    variables: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      filters: null
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Calculate total hours for each kind
  const totals = {
    consulting: 0,
    handsOn: 0,
    squad: 0,
    internal: 0
  };

  if (data?.allocation?.byKind) {
    Object.entries(data.allocation.byKind).forEach(([kind, entries]) => {
      if (Array.isArray(entries) && kind in totals) {
        totals[kind as keyof typeof totals] = entries.reduce((sum, entry) => sum + entry.hours, 0);
      }
    });
  }

  // Process hours data into a map for easy lookup
  const hoursMap: DayHours = {};
  if (data?.allocation?.byKind) {
    Object.entries(data.allocation.byKind).forEach(([kind, entries]) => {
      if (Array.isArray(entries)) {
        entries.forEach(entry => {
          const date = entry.date;
          if (!hoursMap[date]) {
            hoursMap[date] = {
              consulting: 0,
              handsOn: 0,
              squad: 0,
              internal: 0
            };
          }
          hoursMap[date][kind as keyof typeof totals] = entry.hours;
        });
      }
    });
  }

  // Helper function to get ISO week number
  const getWeekNumber = (date: Date) => {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    return {
      month: date.toLocaleString('en', { month: 'short' }),
      week: getWeekNumber(date),
      day: date.getDate(),
      dayOfWeek: date.getDay(),
      monthNum: date.getMonth(),
      year: date.getFullYear()
    };
  };

  // Generate weeks array
  const generateWeeks = () => {
    const weeks = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Get the dates for all days in this week
      const weekDates = [];
      const weekStart = new Date(currentDate);
      
      // Ensure we're starting from Sunday
      const daysSinceLastSunday = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - daysSinceLastSunday);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
      }

      // Determine which month this week belongs to using Friday (index 5)
      const weekFriday = weekDates[5]; // Friday is the determining day
      const formatted = formatDate(weekFriday);

      weeks.push({
        key: currentDate.toISOString(),
        label: formatted.month,
        date: new Date(currentDate),
        weekNumber: formatted.week
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return weeks;
  };

  // Group weeks by month
  const groupWeeksByMonth = (weeks: WeekInfo[]): MonthGroup[] => {
    const groups: MonthGroup[] = [];
    let currentGroup = { month: '', startIndex: 0, count: 0 };

    weeks.forEach((week, index) => {
      if (currentGroup.month === '') {
        currentGroup = { month: week.label, startIndex: index, count: 1 };
      } else if (currentGroup.month === week.label) {
        currentGroup.count++;
      } else {
        groups.push({ ...currentGroup });
        currentGroup = { month: week.label, startIndex: index, count: 1 };
      }
    });

    if (currentGroup.count > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  // Helper function to format tooltip content
  const formatTooltip = (date: string, label: string, hours: number) => {
    if (!label) return '';
    return `${date} - ${selectedKind}: ${hours > 0 ? `${hours.toFixed(1)}h` : 'No hours'}`;
  };

  // Modify generateDayRows to include full date for tooltip
  const generateDayRows = (weeks: WeekInfo[]): DayRow[] => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, dayIndex) => {
      const dayCells = weeks.map(week => {
        const dayDate = new Date(week.date);
        const diff = dayIndex - dayDate.getDay();
        dayDate.setDate(dayDate.getDate() + diff);

        if (dayDate >= startDate && dayDate <= endDate) {
          const formatted = formatDate(dayDate);
          const dateStr = dayDate.toISOString().split('T')[0];
          const hours = hoursMap[dateStr]?.[selectedKind as keyof typeof totals] || 0;
          
          return {
            key: dayDate.toISOString(),
            label: `${formatted.month} ${formatted.day.toString().padStart(2, '0')}`,
            hours,
            fullDate: dateStr
          };
        }
        return { 
          key: `empty-${week.key}-${dayIndex}`, 
          label: '', 
          hours: 0,
          fullDate: ''
        };
      });

      return {
        dayName,
        cells: dayCells
      };
    });
  };

  // Helper function to get color with opacity
  const getColorWithOpacity = (color: string, opacity: number) => {
    // Convert hex to RGB and apply opacity
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Calculate histogram data
  const calculateHistogram = () => {
    // Get all non-zero hours for the selected kind
    const allHours = Object.values(hoursMap)
      .map(day => day[selectedKind as keyof typeof totals])
      .filter(hours => hours > 0);

    if (allHours.length === 0) return [];

    const maxHours = Math.max(...allHours);
    const minHours = Math.min(...allHours);
    const range = maxHours - minHours;
    const binSize = range / 10;

    // Initialize bins
    const bins = Array.from({ length: 10 }, (_, i) => ({
      min: minHours + (i * binSize),
      max: minHours + ((i + 1) * binSize),
      count: 0,
      // Linear opacity from 0.1 to 0.9 based on bin index
      opacity: 0.1 + (i * 0.08)
    }));

    // Count hours into bins
    allHours.forEach(hours => {
      const binIndex = Math.min(Math.floor((hours - minHours) / binSize), 9);
      bins[binIndex].count++;
    });

    return bins;
  };

  const weeks = generateWeeks();
  const monthGroups = groupWeeksByMonth(weeks);
  const dayRows = generateDayRows(weeks);
  const histogramData = calculateHistogram();

  return (
    <div>
      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'consulting' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.consulting}20` }}
              onClick={() => setSelectedKind('consulting')}
            >
              <h3 className="font-semibold">Consulting</h3>
              <p>{totals.consulting.toFixed(1)}h</p>
            </div>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'handsOn' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.handsOn}20` }}
              onClick={() => setSelectedKind('handsOn')}
            >
              <h3 className="font-semibold">Hands On</h3>
              <p>{totals.handsOn.toFixed(1)}h</p>
            </div>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'squad' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.squad}20` }}
              onClick={() => setSelectedKind('squad')}
            >
              <h3 className="font-semibold">Squad</h3>
              <p>{totals.squad.toFixed(1)}h</p>
            </div>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'internal' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.internal}20` }}
              onClick={() => setSelectedKind('internal')}
            >
              <h3 className="font-semibold">Internal</h3>
              <p>{totals.internal.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      )}
      {data && histogramData.length > 0 && (
        <div className="mt-8 mb-4">
          <h3 className="text-sm font-medium mb-2">Hours Distribution</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {histogramData.map((bin, index) => (
                    <th key={index} className="p-2 border text-xs font-medium">
                      {bin.min.toFixed(1)}-{bin.max.toFixed(1)}h
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {histogramData.map((bin, index) => (
                    <td 
                      key={index} 
                      className="p-2 border text-center transition-colors"
                      style={{ 
                        backgroundColor: getColorWithOpacity(STAT_COLORS[selectedKind as keyof typeof STAT_COLORS], bin.opacity * 0.5)
                      }}
                    >
                      <div className="text-sm font-medium">{bin.count}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border text-sm font-medium">Day</th>
                {monthGroups.map(group => (
                  <th 
                    key={`${group.month}-${group.startIndex}`} 
                    className="p-2 border text-sm font-medium text-left"
                    colSpan={group.count}
                  >
                    {group.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dayRows.map(row => (
                <tr key={row.dayName}>
                  <td className="p-2 border text-sm font-medium">{row.dayName}</td>
                  {row.cells.map(cell => (
                    <TooltipProvider key={cell.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <td 
                            className="p-2 border text-sm hover:bg-gray-50"
                          >
                            {cell.label}
                            {cell.hours > 0 && (
                              <div className="text-xs text-gray-600">
                                {cell.hours.toFixed(1)}h
                              </div>
                            )}
                          </td>
                        </TooltipTrigger>
                        {cell.label && (
                          <TooltipContent>
                            <p>{formatTooltip(cell.fullDate, cell.label, cell.hours)}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OneYearAllocation;
