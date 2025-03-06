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
  subDays,
  parseISO
} from "date-fns";
import { STAT_COLORS, StatType } from "@/app/constants/colors";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const GET_TIMESHEET_CALENDAR = gql`
  query GetTimesheetCalendar($slug: String!, $filters: [DatasetFilterInput]) {
    timesheet1: timesheet(slug: $slug, filters: $filters) {
      appointments {
        data {
          kind
          date
          consultantOrEngineer { name }
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
  consultantOrEngineer: {
    name: string;
  };
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

interface WeekTotal {
  consulting: number;
  handsOn: number;
  squad: number;
  internal: number;
}

interface Week {
  days: Date[];
  total: WeekTotal;
}

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
  const dayAppointments = appointments.filter(apt => isSameDay(parseISO(apt.date), date));

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
      {dayAppointments.length > 0 && (
        <div className="absolute bottom-[2px] left-[2px] text-[8px] text-gray-500">
          {dayAppointments.map((apt, idx) => (
            <div key={idx} className="truncate">
              {apt.client.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

interface TimesheetCalendarProps {
  filters?: Array<{ field: string; selectedValues: string[] }>;
}

export function TimesheetCalendar({ filters }: TimesheetCalendarProps) {
  const client = useEdgeClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStatType, setSelectedStatType] = useState<StatType>('consulting');
  const [selection, setSelection] = useState<SelectionType>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Appointment;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Appointment) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleMonthChange = (increment: number) => {
    setSelectedDate(addMonths(selectedDate, increment));
    setSelection(null);
  };

  const handleStatTypeChange = (newType: StatType) => {
    setSelectedStatType(newType);
    setSelection(null);
  };

  const handleSelect = (type: 'cell' | 'column' | 'row', weekIndex: number, dayIndex: number) => {
    setSelection({ type, weekIndex, dayIndex });
    setIsSheetOpen(true);
  };

  // Calculate the calendar grid
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Generate the slug based on calendar dates
  const timesheetSlug = useMemo(() => {
    const startDate = format(calendarStart, 'dd-MM-yyyy');
    const endDate = format(calendarEnd, 'dd-MM-yyyy');
    return `timesheet-${startDate}-${endDate}`;
  }, [calendarStart, calendarEnd]);

  const { loading, error, data } = useQuery<TimesheetData>(GET_TIMESHEET_CALENDAR, {
    client: client || undefined,
    ssr: true,
    variables: {
      slug: timesheetSlug,
      filters: filters || null
    }
  });

  // Get all days for the calendar grid
  const days = useMemo(() => eachDayOfInterval({ start: calendarStart, end: calendarEnd }), [calendarStart, calendarEnd]);

  // Calculate week totals
  const weeks = useMemo(() => {
    const result: Week[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      const weekTotal = {
        consulting: 0,
        handsOn: 0,
        squad: 0,
        internal: 0
      };

      weekDays.forEach(day => {
        const dayData = data?.timesheet1.byDate.data.find(d => {
          const appointmentDate = new Date(d.date);
          appointmentDate.setDate(appointmentDate.getDate() + 1);
          appointmentDate.setHours(12, 0, 0, 0);
          const calendarDate = new Date(day);
          calendarDate.setHours(12, 0, 0, 0);
          return calendarDate.getTime() === appointmentDate.getTime();
        });
        if (dayData) {
          weekTotal.consulting += dayData.totalConsultingHours;
          weekTotal.handsOn += dayData.totalHandsOnHours;
          weekTotal.squad += dayData.totalSquadHours;
          weekTotal.internal += dayData.totalInternalHours;
        }
      });

      result.push({ days: weekDays, total: weekTotal });
    }
    return result;
  }, [days, data?.timesheet1.byDate.data]);

  // Calculate column totals
  const columnTotals = useMemo(() => {
    const totals = Array(8).fill(null).map(() => ({
      consulting: 0,
      handsOn: 0,
      squad: 0,
      internal: 0
    }));

    days.forEach(date => {
      const dayData = data?.timesheet1.byDate.data.find(d => {
        const appointmentDate = new Date(d.date);
        appointmentDate.setDate(appointmentDate.getDate() + 1);
        appointmentDate.setHours(12, 0, 0, 0);
        const calendarDate = new Date(date);
        calendarDate.setHours(12, 0, 0, 0);
        return calendarDate.getTime() === appointmentDate.getTime();
      });
      if (dayData) {
        const dayIndex = date.getDay();
        totals[dayIndex].consulting += dayData.totalConsultingHours;
        totals[dayIndex].handsOn += dayData.totalHandsOnHours;
        totals[dayIndex].squad += dayData.totalSquadHours;
        totals[dayIndex].internal += dayData.totalInternalHours;
      }
    });

    // Calculate grand total
    const grandTotal = {
      consulting: totals.reduce((sum, col) => sum + col.consulting, 0),
      handsOn: totals.reduce((sum, col) => sum + col.handsOn, 0),
      squad: totals.reduce((sum, col) => sum + col.squad, 0),
      internal: totals.reduce((sum, col) => sum + col.internal, 0)
    };

    // Add grand total to the last column
    totals[7] = grandTotal;

    return totals;
  }, [days, data?.timesheet1.byDate.data]);

  // Get available stat types
  const availableStatTypes = useMemo(() => {
    if (!data) return [];
    return Object.entries({
      consulting: data.timesheet1.byDate.data.reduce((sum, day) => sum + day.totalConsultingHours, 0),
      handsOn: data.timesheet1.byDate.data.reduce((sum, day) => sum + day.totalHandsOnHours, 0),
      squad: data.timesheet1.byDate.data.reduce((sum, day) => sum + day.totalSquadHours, 0),
      internal: data.timesheet1.byDate.data.reduce((sum, day) => sum + day.totalInternalHours, 0),
    })
      .filter(([_, hours]) => hours > 0)
      .map(([type]) => type as StatType);
  }, [data?.timesheet1.byDate.data]);

  // Calculate days with data
  const daysWithData = useMemo(() => {
    if (!data) return 0;
    return data.timesheet1.byDate.data.filter(day => {
      const appointmentDate = new Date(day.date);
      appointmentDate.setDate(appointmentDate.getDate() + 1);
      appointmentDate.setHours(12, 0, 0, 0);
      const isCurrentMonth = isSameMonth(appointmentDate, selectedDate);
      
      if (!isCurrentMonth) return false;

      const hours = selectedStatType === 'consulting' ? day.totalConsultingHours :
                   selectedStatType === 'handsOn' ? day.totalHandsOnHours :
                   selectedStatType === 'squad' ? day.totalSquadHours :
                   day.totalInternalHours;
      return hours > 0;
    }).length;
  }, [data?.timesheet1.byDate.data, selectedDate, selectedStatType]);

  // Calculate sorted appointments
  const sortedAppointments = useMemo(() => {
    if (!selection || !data) return [];

    // Filter appointments by selected stat type
    const filteredAppointments = data.timesheet1.appointments.data.filter(apt => {
      const appointmentDate = new Date(apt.date);
      appointmentDate.setDate(appointmentDate.getDate() + 1);
      appointmentDate.setHours(12, 0, 0, 0);
      const isCurrentMonth = isSameMonth(appointmentDate, selectedDate);
      
      if (!isCurrentMonth) return false;

      const kindMap: Record<StatType, string> = {
        consulting: 'consulting',
        handsOn: 'handsOn',
        squad: 'squad',
        internal: 'internal'
      };

      const expectedKind = kindMap[selectedStatType];
      const matches = apt.kind.toLowerCase() === expectedKind.toLowerCase();

      return matches;
    });

    let selectedAppointments: Appointment[] = [];

    if (selection.type === 'cell') {
      const date = weeks[selection.weekIndex!].days[selection.dayIndex!];
      selectedAppointments = filteredAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        appointmentDate.setDate(appointmentDate.getDate() + 1);
        appointmentDate.setHours(12, 0, 0, 0);
        const calendarDate = new Date(date);
        calendarDate.setHours(12, 0, 0, 0);
        return calendarDate.getTime() === appointmentDate.getTime();
      });
    } else if (selection.type === 'column') {
      const selectedDayIndex = selection.dayIndex!;
      selectedAppointments = filteredAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        appointmentDate.setDate(appointmentDate.getDate() + 1);
        appointmentDate.setHours(12, 0, 0, 0);
        return appointmentDate.getDay() === selectedDayIndex;
      });
    } else if (selection.type === 'row') {
      const weekDays = weeks[selection.weekIndex!].days;
      selectedAppointments = filteredAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        appointmentDate.setDate(appointmentDate.getDate() + 1);
        appointmentDate.setHours(12, 0, 0, 0);
        return weekDays.some(day => {
          const calendarDate = new Date(day);
          calendarDate.setHours(12, 0, 0, 0);
          return calendarDate.getTime() === appointmentDate.getTime();
        });
      });
    }

    if (!sortConfig) return selectedAppointments;

    return [...selectedAppointments].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortConfig.key === 'timeInHs') {
        return sortConfig.direction === 'asc' 
          ? a.timeInHs - b.timeInHs 
          : b.timeInHs - a.timeInHs;
      }

      if (sortConfig.key === 'client') {
        return sortConfig.direction === 'asc'
          ? a.client.name.localeCompare(b.client.name)
          : b.client.name.localeCompare(a.client.name);
      }

      if (sortConfig.key === 'consultantOrEngineer') {
        return sortConfig.direction === 'asc'
          ? a.consultantOrEngineer.name.localeCompare(b.consultantOrEngineer.name)
          : b.consultantOrEngineer.name.localeCompare(a.consultantOrEngineer.name);
      }

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return 0;
    });
  }, [selection, selectedStatType, selectedDate, data?.timesheet1.appointments.data, weeks, sortConfig]);

  // Early returns after all hooks
  if (!client) return <p>Loading client...</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  // If selectedStatType is not available, use first available type
  if (!availableStatTypes.includes(selectedStatType) && availableStatTypes.length > 0) {
    setSelectedStatType(availableStatTypes[0]);
  }

  return (
    <>
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
              {daysWithData} days with {selectedStatType === 'handsOn' ? 'hands-on' : selectedStatType} data
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
                const dayData = data?.timesheet1.byDate.data.find(d => {
                  const appointmentDate = new Date(d.date);
                  appointmentDate.setDate(appointmentDate.getDate() + 1);
                  appointmentDate.setHours(12, 0, 0, 0);
                  const calendarDate = new Date(date);
                  calendarDate.setHours(12, 0, 0, 0);
                  return calendarDate.getTime() === appointmentDate.getTime();
                });
                const dayAppointments = data?.timesheet1.appointments.data.filter(apt => {
                  const appointmentDate = new Date(apt.date);
                  appointmentDate.setDate(appointmentDate.getDate() + 1);
                  appointmentDate.setHours(12, 0, 0, 0);
                  const calendarDate = new Date(date);
                  calendarDate.setHours(12, 0, 0, 0);
                  return calendarDate.getTime() === appointmentDate.getTime();
                });
                
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
                    columnTotal={columnTotals[date.getDay()][selectedStatType]}
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[1000px] sm:max-w-[1000px]">
          <SheetHeader>
            <SheetTitle>
              {selection?.type === 'cell' ? 'Day Appointments' :
               selection?.type === 'column' ? 'Day of Week Appointments' :
               'Week Appointments'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {(!filters?.some(f => f.field.toLowerCase() === 'date' && f.selectedValues.length === 1)) && (
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('date')}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        Date
                        {sortConfig?.key === 'date' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↓' : '↑'}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {(!filters?.some(f => f.field.toLowerCase() === 'clientname' && f.selectedValues.length === 1)) && (
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('client')}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        Client
                        {sortConfig?.key === 'client' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↓' : '↑'}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {(!filters?.some(f => f.field.toLowerCase() === 'workername' && f.selectedValues.length === 1)) && (
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('consultantOrEngineer')}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        Consultant/Engineer
                        {sortConfig?.key === 'consultantOrEngineer' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↓' : '↑'}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {(!filters?.some(f => f.field.toLowerCase() === 'sponsor' && f.selectedValues.length === 1)) && (
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('sponsor')}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        Sponsor
                        {sortConfig?.key === 'sponsor' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↓' : '↑'}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {(!filters?.some(f => f.field.toLowerCase() === 'timeinhs' && f.selectedValues.length === 1)) && (
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('timeInHs')}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        Hours
                        {sortConfig?.key === 'timeInHs' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↓' : '↑'}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {(!filters?.some(f => f.field.toLowerCase() === 'comment' && f.selectedValues.length === 1)) && (
                    <TableHead className="text-xs">Comment</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.map((apt, idx) => (
                  <TableRow key={idx}>
                    {(!filters?.some(f => f.field.toLowerCase() === 'date' && f.selectedValues.length === 1)) && (
                      <TableCell className="text-xs py-2">{format(new Date(apt.date), 'MMM dd, yyyy')}</TableCell>
                    )}
                    {(!filters?.some(f => f.field.toLowerCase() === 'clientname' && f.selectedValues.length === 1)) && (
                      <TableCell className="text-xs py-2">{apt.client.name}</TableCell>
                    )}
                    {(!filters?.some(f => f.field.toLowerCase() === 'workername' && f.selectedValues.length === 1)) && (
                      <TableCell className="text-xs py-2">{apt.consultantOrEngineer.name}</TableCell>
                    )}
                    {(!filters?.some(f => f.field.toLowerCase() === 'sponsor' && f.selectedValues.length === 1)) && (
                      <TableCell className="text-xs py-2">{apt.sponsor}</TableCell>
                    )}
                    {(!filters?.some(f => f.field.toLowerCase() === 'timeinhs' && f.selectedValues.length === 1)) && (
                      <TableCell className="text-xs py-2">{apt.timeInHs}h</TableCell>
                    )}
                    {(!filters?.some(f => f.field.toLowerCase() === 'comment' && f.selectedValues.length === 1)) && (
                      <TableCell className="text-xs py-2">{apt.comment}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 