import { gql, useQuery } from "@apollo/client";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import { useState, useMemo } from "react";
import React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays
} from "date-fns";
import { STAT_COLORS, StatType } from "@/app/constants/colors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GET_TIMESHEET_CALENDAR = gql`
  query GetTimesheetCalendar($slug: String!) {
    timesheet1: timesheet(slug: $slug) {
      appointments {
        data {
          kind
          date
          client {
            slug
            name
          }
          sponsor
          comment
          timeInHs
        }
      }
      byDate {
        data {
          date
          totalHours
          totalConsultingHours
          totalHandsOnHours
          totalSquadHours
          totalInternalHours
        }
      }
    }
  }
`;

interface Appointment {
  kind: string;
  date: string;
  client: {
    slug: string;
    name: string;
  };
  sponsor: string;
  comment: string;
  timeInHs: number;
}

interface DailyTotal {
  date: string;
  totalHours: number;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
}

interface TimesheetData {
  timesheet1: {
    appointments: {
      data: Appointment[];
    };
    byDate: {
      data: DailyTotal[];
    };
  };
}

type CellType = 'prev' | 'current' | 'next' | 'total';

type SelectionType = {
  type: 'cell' | 'column' | 'row';
  weekIndex?: number;
  dayIndex?: number;
} | null;

const DayCell = ({ 
  date, 
  hours, 
  selectedStatType,
  appointments,
  type = 'current',
  weekTotal,
  columnTotal,
  weekIndex,
  dayIndex,
  selection,
  onSelect
}: { 
  date: Date;
  hours: DailyTotal | undefined;
  selectedStatType: StatType;
  appointments: Appointment[];
  type?: CellType;
  weekTotal: number;
  columnTotal: number;
  weekIndex: number;
  dayIndex: number;
  selection: SelectionType;
  onSelect: (type: 'cell' | 'column' | 'row', weekIndex: number, dayIndex: number) => void;
}) => {
  const isCurrentMonth = isSameMonth(date, new Date());
  const statHours = hours ? (
    selectedStatType === 'consulting' ? hours.totalConsultingHours :
    selectedStatType === 'handsOn' ? hours.totalHandsOnHours :
    selectedStatType === 'squad' ? hours.totalSquadHours :
    hours.totalInternalHours
  ) : 0;
  const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.date), date));

  const isSelected = selection && (
    (selection.type === 'cell' && selection.weekIndex === weekIndex && selection.dayIndex === dayIndex) ||
    (selection.type === 'column' && selection.dayIndex === dayIndex) ||
    (selection.type === 'row' && selection.weekIndex === weekIndex)
  );

  const cellContent = (
    <div 
      className={`
        p-2 text-center relative h-[70px] flex flex-col justify-between cursor-pointer
        border-b border-r border-gray-200 last:border-r-0 last:border-b-0
        ${type === 'current' ? '' : type === 'total' ? 'bg-gray-50' : 'text-gray-400'}
        ${statHours > 0 ? 'bg-gray-50' : ''}
        ${isSelected ? '!border-blue-600 !border-2' : ''}
      `}
      onClick={() => onSelect('cell', weekIndex, dayIndex)}
    >
      {statHours > 0 && weekTotal > 0 && (
        <span className="absolute top-[2px] left-[2px] text-[8px] text-gray-500">
          {((statHours / weekTotal) * 100).toFixed(1)}%
        </span>
      )}
      <span className={`absolute top-[15px] left-1/2 transform -translate-x-1/2 text-[12px]`}>
        {format(date, 'd')}
      </span>
      {statHours > 0 && (
        <>
          <span 
            style={{color: type === 'current' ? STAT_COLORS[selectedStatType] : '#9CA3AF'}} 
            className="absolute bottom-[15px] text-[14px] left-1/2 transform -translate-x-1/2 block"
          >
            {Number.isInteger(statHours) ? `${statHours}h` : `${statHours.toFixed(1)}h`}
          </span>
          {columnTotal > 0 && (
            <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
              {((statHours / columnTotal) * 100).toFixed(1)}%
            </span>
          )}
        </>
      )}
    </div>
  );

  if (type === 'current' && (statHours > 0 || dayAppointments.length > 0)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cellContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              {statHours > 0 && (
                <p className="font-semibold">
                  {selectedStatType.charAt(0).toUpperCase() + selectedStatType.slice(1)}: {statHours}h
                </p>
              )}
              {dayAppointments.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Appointments:</p>
                  {dayAppointments.map((apt, idx) => (
                    <p key={idx} className="text-sm">
                      {apt.client.name} - {apt.timeInHs}h
                    </p>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cellContent;
};

const TotalCell = ({ 
  total, 
  selectedStatType,
  type = 'week',
  grandTotal,
  weekIndex,
  dayIndex,
  selection,
  onSelect
}: { 
  total: number;
  selectedStatType: StatType;
  type?: 'week' | 'month';
  grandTotal?: number;
  weekIndex: number;
  dayIndex: number;
  selection: SelectionType;
  onSelect: (type: 'cell' | 'column' | 'row', weekIndex: number, dayIndex: number) => void;
}) => {
  const isSelected = selection && (
    (selection.type === 'cell' && selection.weekIndex === weekIndex && selection.dayIndex === dayIndex) ||
    (selection.type === 'column' && selection.dayIndex === dayIndex) ||
    (selection.type === 'row' && selection.weekIndex === weekIndex)
  );

  return (
    <div 
      className={`
        p-2 text-center relative h-[70px] flex flex-col justify-between cursor-pointer
        border-b border-r border-gray-200 last:border-r-0 last:border-b-0
        bg-gray-50
        ${isSelected ? '!border-blue-600 !border-2' : ''}
      `}
      onClick={() => onSelect('row', weekIndex, dayIndex)}
    >
      <span 
        style={{color: STAT_COLORS[selectedStatType]}} 
        className="absolute text-[14px] top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {total.toFixed(1)}h
      </span>
      {total > 0 && grandTotal && (
        <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">
          {((total / grandTotal) * 100).toFixed(1)}%
        </span>
      )}
    </div>
  );
};

const DayOfWeekTotalCell = ({ 
  hours, 
  index, 
  grandTotal, 
  selectedStatType,
  selection,
  onSelect
}: { 
  hours: {
    consulting: number;
    handsOn: number;
    squad: number;
    internal: number;
  };
  index: number;
  grandTotal?: number;
  selectedStatType: StatType;
  selection: SelectionType;
  onSelect: (type: 'cell' | 'column' | 'row', weekIndex: number, dayIndex: number) => void;
}) => {
  const statHours = hours[selectedStatType];
  const isSelected = selection && (
    (selection.type === 'column' && selection.dayIndex === index)
  );
  
  return (
    <div 
      className={`
        p-2 text-center bg-gray-50 flex items-center justify-center relative h-[70px] border-r border-gray-200 last:border-r-0 cursor-pointer
        ${isSelected ? '!border-blue-600 !border-2' : ''}
      `}
      onClick={() => onSelect('column', 0, index)}
    >
      {statHours > 0 && (
        <>
          {index < 7 && grandTotal && (
            <span className="absolute top-[2px] left-[2px] text-[8px] text-gray-500">
              {((statHours / grandTotal) * 100).toFixed(1)}%
            </span>
          )}
          <span 
            className="text-[14px]" 
            style={{color: STAT_COLORS[selectedStatType]}}
          >
            {Number.isInteger(statHours) ? `${statHours}h` : `${statHours.toFixed(1)}h`}
          </span>
        </>
      )}
    </div>
  );
};

export function TimesheetCalendar() {
  const client = useEdgeClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStatType, setSelectedStatType] = useState<StatType>('consulting');
  const [selection, setSelection] = useState<SelectionType>(null);

  if (!client) return <p>Loading client...</p>;

  // Calculate the calendar grid
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Generate the slug based on calendar dates
  const timesheetSlug = useMemo(() => {
    const startDate = format(calendarStart, 'dd-MM-yyyy');
    const endDate = format(calendarEnd, 'dd-MM-yyyy');
    return `timesheet-${startDate}-${endDate}`;
  }, [calendarStart, calendarEnd]);

  const { loading, error, data } = useQuery<TimesheetData>(GET_TIMESHEET_CALENDAR, {
    client,
    ssr: true,
    variables: {
      slug: timesheetSlug
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const { appointments, byDate } = data.timesheet1;

  const handleMonthChange = (increment: number) => {
    setSelectedDate(addMonths(selectedDate, increment));
  };

  const handleStatTypeChange = (newType: StatType) => {
    setSelectedStatType(newType);
  };

  const handleSelect = (type: 'cell' | 'column' | 'row', weekIndex: number, dayIndex: number) => {
    setSelection({ type, weekIndex, dayIndex });
  };

  // Get all days for the calendar grid
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get available stat types (those with hours > 0)
  const availableStatTypes = Object.entries({
    consulting: byDate.data.reduce((sum, day) => sum + day.totalConsultingHours, 0),
    handsOn: byDate.data.reduce((sum, day) => sum + day.totalHandsOnHours, 0),
    squad: byDate.data.reduce((sum, day) => sum + day.totalSquadHours, 0),
    internal: byDate.data.reduce((sum, day) => sum + day.totalInternalHours, 0),
  })
    .filter(([_, hours]) => hours > 0)
    .map(([type]) => type as StatType);

  // If selectedStatType is not available, use first available type
  if (!availableStatTypes.includes(selectedStatType) && availableStatTypes.length > 0) {
    setSelectedStatType(availableStatTypes[0]);
  }

  // Calculate week totals
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7);
    const weekTotal = {
      consulting: 0,
      handsOn: 0,
      squad: 0,
      internal: 0
    };

    weekDays.forEach(day => {
      const dayData = byDate.data.find(d => format(new Date(d.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      if (dayData) {
        weekTotal.consulting += dayData.totalConsultingHours;
        weekTotal.handsOn += dayData.totalHandsOnHours;
        weekTotal.squad += dayData.totalSquadHours;
        weekTotal.internal += dayData.totalInternalHours;
      }
    });

    weeks.push({ days: weekDays, total: weekTotal });
  }

  // Calculate month totals
  const monthTotal = {
    consulting: 0,
    handsOn: 0,
    squad: 0,
    internal: 0
  };

  byDate.data.forEach(day => {
    monthTotal.consulting += day.totalConsultingHours;
    monthTotal.handsOn += day.totalHandsOnHours;
    monthTotal.squad += day.totalSquadHours;
    monthTotal.internal += day.totalInternalHours;
  });

  // Calculate column totals
  const columnTotals = Array(8).fill(null).map(() => ({
    consulting: 0,
    handsOn: 0,
    squad: 0,
    internal: 0
  }));

  weeks.forEach(week => {
    week.days.forEach((date, index) => {
      const dayData = byDate.data.find(d => format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      if (dayData) {
        columnTotals[index].consulting += dayData.totalConsultingHours;
        columnTotals[index].handsOn += dayData.totalHandsOnHours;
        columnTotals[index].squad += dayData.totalSquadHours;
        columnTotals[index].internal += dayData.totalInternalHours;
      }
    });
    // Add week total to the last column
    columnTotals[7].consulting += week.total.consulting;
    columnTotals[7].handsOn += week.total.handsOn;
    columnTotals[7].squad += week.total.squad;
    columnTotals[7].internal += week.total.internal;
  });

  return (
    <div className="w-full border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => handleMonthChange(-1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          ←
        </button>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">
            {format(selectedDate, 'MMMM yyyy')}
          </span>
          <span className="text-sm text-gray-500">
            {byDate.data.length} days with data
          </span>
        </div>
        <button 
          onClick={() => handleMonthChange(1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          →
        </button>
      </div>

      {availableStatTypes.length > 0 && (
        <Tabs value={selectedStatType} defaultValue={availableStatTypes[0]} className="mb-4">
          <TabsList className="w-full">
            {availableStatTypes.map(type => (
              <TabsTrigger 
                key={type}
                value={type} 
                onClick={() => handleStatTypeChange(type)} 
                className="flex-1"
              >
                {type === 'handsOn' ? 'Hands-on' : type.charAt(0).toUpperCase() + type.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-8 border border-gray-200">
        {/* Header row with day names */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Total'].map((day) => (
          <div 
            key={day}
            className="text-center p-2 text-[12px] text-[#3f3f46b2] border-b border-r border-gray-200 last:border-r-0 h-[70px] flex items-center justify-center"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.days.map((date, dayIndex) => {
              const dayData = byDate.data.find(d => format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
              const dayAppointments = appointments.data.filter(apt => format(new Date(apt.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
              
              const type = isSameMonth(date, selectedDate) ? 'current' :
                          date < monthStart ? 'prev' : 'next';

              return (
                <DayCell
                  key={format(date, 'yyyy-MM-dd')}
                  date={date}
                  hours={dayData}
                  selectedStatType={selectedStatType}
                  appointments={dayAppointments}
                  type={type}
                  weekTotal={week.total[selectedStatType]}
                  columnTotal={columnTotals[dayIndex][selectedStatType]}
                  weekIndex={weekIndex}
                  dayIndex={dayIndex}
                  selection={selection}
                  onSelect={handleSelect}
                />
              );
            })}
            {/* Week total */}
            <TotalCell
              total={week.total[selectedStatType]}
              selectedStatType={selectedStatType}
              type="week"
              grandTotal={columnTotals[7][selectedStatType]}
              weekIndex={weekIndex}
              dayIndex={7}
              selection={selection}
              onSelect={handleSelect}
            />
          </React.Fragment>
        ))}

        {/* Column totals row */}
        {columnTotals.map((total, index) => (
          <DayOfWeekTotalCell
            key={`total-${index}`}
            hours={total}
            index={index}
            grandTotal={columnTotals[7][selectedStatType]}
            selectedStatType={selectedStatType}
            selection={selection}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
} 