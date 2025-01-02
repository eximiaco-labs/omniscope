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
  workerName?: string;
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

const OneYearAllocation: React.FC<ContributionProps> = ({ month, year, workerName }) => {
  const [selectedKind, setSelectedKind] = useState<string>('consulting');
  const [selectedBinIndex, setSelectedBinIndex] = useState<number | null>(null);
  const currentDate = new Date();
  const specifiedMonth = month || currentDate.getMonth() + 1;
  const specifiedYear = year || currentDate.getFullYear();

  // Calculate end date (last day of specified month/year)
  const endDate = new Date(specifiedYear, specifiedMonth, 0);
  
  // Calculate start date (first day, 11 months before specified month/year)
  const startDate = new Date(specifiedYear, specifiedMonth - 12, 1);

  // Create filters if workerName is provided
  const filters = workerName ? [{
    field: "WorkerName",
    selectedValues: [workerName]
  }] : null;

  const { loading, error, data } = useQuery(ALLOCATION_QUERY, {
    variables: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      filters
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
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleString('en', { 
      month: 'short',
      day: '2-digit'
    });
    return `${formattedDate} - ${hours > 0 ? `${hours.toFixed(1)}h` : 'No hours'}`;
  };

  // Helper function to get darker color for border
  const getDarkerColor = (color: string, opacity: number) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const darken = 0.6 - (opacity * 0.2); // More contrast for borders
    return `rgba(${Math.floor(r * darken)}, ${Math.floor(g * darken)}, ${Math.floor(b * darken)}, ${opacity + 0.3})`;
  };

  // Helper function to get bin index for hours
  const getBinIndex = (hours: number, histogramData: any[]) => {
    if (hours === 0 || histogramData.length === 0) return -1;
    return histogramData.findIndex(bin => hours >= bin.min && hours <= bin.max);
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
    // Convert hex to RGB and apply opacity with increased contrast
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Increase contrast by adjusting the RGB values based on opacity
    const contrastFactor = 0.7 + (opacity * 0.3); // Will be between 0.7 and 1.0
    const adjustedR = Math.round(r * contrastFactor);
    const adjustedG = Math.round(g * contrastFactor);
    const adjustedB = Math.round(b * contrastFactor);
    
    return `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${opacity})`;
  };

  // Calculate histogram data
  const calculateHistogram = () => {
    // Get all non-zero hours for the selected kind
    const allHours = Object.values(hoursMap)
      .map(day => day[selectedKind as keyof typeof totals])
      .filter(hours => hours > 0);

    if (allHours.length === 0) return [];

    // Sort hours to analyze distribution
    const sortedHours = [...allHours].sort((a, b) => a - b);
    
    // Find unique values with a small tolerance to group very close values
    const tolerance = 0.1; // 6 minutes tolerance
    const uniqueValues = sortedHours.reduce((acc, curr) => {
      if (acc.length === 0 || Math.abs(curr - acc[acc.length - 1]) > tolerance) {
        acc.push(curr);
      }
      return acc;
    }, [] as number[]);

    // If we have very few unique values, use them directly as bin boundaries
    if (uniqueValues.length <= 5) {
      const bins = uniqueValues.map((value, i) => ({
        min: value - tolerance/2,
        max: value + tolerance/2,
        count: sortedHours.filter(h => Math.abs(h - value) <= tolerance).length,
        opacity: 0.3 + (i * (0.6 / Math.max(1, uniqueValues.length - 1)))
      }));
      return bins;
    }

    // For more distributed values, create adaptive bins
    const minHours = sortedHours[0];
    const maxHours = sortedHours[sortedHours.length - 1];
    
    // Start with a target of 5 bins
    let targetBins = 5;
    let binSize = (maxHours - minHours) / targetBins;
    
    // Create initial bins
    const bins: { min: number; max: number; count: number; opacity: number }[] = [];
    let currentMin = minHours;
    
    while (currentMin < maxHours) {
      const currentMax = Math.min(maxHours, currentMin + binSize);
      const count = sortedHours.filter(h => h >= currentMin && h < currentMax).length;
      
      // Only add bin if it has values
      if (count > 0) {
        bins.push({
          min: currentMin,
          max: currentMax,
          count,
          opacity: 0.3 + (bins.length * (0.6 / Math.min(4, targetBins - 1)))
        });
      }
      
      currentMin = currentMax;
    }

    return bins;
  };

  // Helper function to check if hours fall within selected bin
  const isInSelectedBin = (hours: number, histogramData: any[]) => {
    if (selectedBinIndex === null) return true;
    if (hours === 0) return false;
    const bin = histogramData[selectedBinIndex];
    return bin && hours >= bin.min && hours <= bin.max;
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
              onClick={() => {
                setSelectedKind('consulting');
                setSelectedBinIndex(null);
              }}
            >
              <h3 className="font-semibold">Consulting</h3>
              <p>{totals.consulting.toFixed(1)}h</p>
            </div>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'handsOn' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.handsOn}20` }}
              onClick={() => {
                setSelectedKind('handsOn');
                setSelectedBinIndex(null);
              }}
            >
              <h3 className="font-semibold">Hands On</h3>
              <p>{totals.handsOn.toFixed(1)}h</p>
            </div>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'squad' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.squad}20` }}
              onClick={() => {
                setSelectedKind('squad');
                setSelectedBinIndex(null);
              }}
            >
              <h3 className="font-semibold">Squad</h3>
              <p>{totals.squad.toFixed(1)}h</p>
            </div>
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedKind === 'internal' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: `${STAT_COLORS.internal}20` }}
              onClick={() => {
                setSelectedKind('internal');
                setSelectedBinIndex(null);
              }}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {histogramData.map((bin, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg cursor-pointer transition-all hover:ring-1 hover:ring-gray-300
                  ${selectedBinIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                style={{ 
                  backgroundColor: getColorWithOpacity(STAT_COLORS[selectedKind as keyof typeof STAT_COLORS], bin.opacity * 0.5)
                }}
                onClick={() => setSelectedBinIndex(selectedBinIndex === index ? null : index)}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600">
                    {bin.min.toFixed(1)}h - {bin.max.toFixed(1)}h
                  </span>
                  <span className="text-lg font-semibold mt-1">
                    {bin.count}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    occurrences
                  </span>
                </div>
              </div>
            ))}
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
                            <div className="flex items-center justify-center">
                              {cell.label && (
                                <div 
                                  className="w-2.5 h-2.5 rounded-[1px] transition-opacity duration-200"
                                  style={{ 
                                    backgroundColor: cell.hours > 0 
                                      ? getColorWithOpacity(
                                          STAT_COLORS[selectedKind as keyof typeof STAT_COLORS], 
                                          histogramData[getBinIndex(cell.hours, histogramData)]?.opacity || 0
                                        )
                                      : 'rgba(200, 200, 200, 0.1)', // Lighter gray for zero/no hours
                                    border: `1px solid ${cell.hours > 0 
                                      ? getDarkerColor(
                                          STAT_COLORS[selectedKind as keyof typeof STAT_COLORS],
                                          histogramData[getBinIndex(cell.hours, histogramData)]?.opacity || 0
                                        )
                                      : 'rgba(150, 150, 150, 0.2)'}`, // Lighter gray for zero/no hours borders
                                    opacity: isInSelectedBin(cell.hours, histogramData) ? 1 : 0.1
                                  }}
                                />
                              )}
                            </div>
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
