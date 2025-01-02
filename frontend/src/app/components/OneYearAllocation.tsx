import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { STAT_COLORS } from '../constants/colors';

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

  // Generate days for each week
  const generateDayRows = (weeks: WeekInfo[]): DayRow[] => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, dayIndex) => {
      const dayCells = weeks.map(week => {
        const dayDate = new Date(week.date);
        // Adjust to the correct day of the week
        const diff = dayIndex - dayDate.getDay();
        dayDate.setDate(dayDate.getDate() + diff);

        // Check if the adjusted date is within our range
        if (dayDate >= startDate && dayDate <= endDate) {
          const formatted = formatDate(dayDate);
          return {
            key: dayDate.toISOString(),
            label: `${formatted.month} ${formatted.day.toString().padStart(2, '0')}`
          };
        }
        return { key: `empty-${week.key}-${dayIndex}`, label: '' };
      });

      return {
        dayName,
        cells: dayCells
      };
    });
  };

  const weeks = generateWeeks();
  const monthGroups = groupWeeksByMonth(weeks);
  const dayRows = generateDayRows(weeks);

  return (
    <div>
      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.consulting}20` }}>
              <h3 className="font-semibold">Consulting</h3>
              <p>{totals.consulting.toFixed(1)}h</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.handsOn}20` }}>
              <h3 className="font-semibold">Hands On</h3>
              <p>{totals.handsOn.toFixed(1)}h</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.squad}20` }}>
              <h3 className="font-semibold">Squad</h3>
              <p>{totals.squad.toFixed(1)}h</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.internal}20` }}>
              <h3 className="font-semibold">Internal</h3>
              <p>{totals.internal.toFixed(1)}h</p>
            </div>
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
                    className="p-2 border text-sm font-medium"
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
                    <td key={cell.key} className="p-2 border text-sm">
                      {cell.label}
                    </td>
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
