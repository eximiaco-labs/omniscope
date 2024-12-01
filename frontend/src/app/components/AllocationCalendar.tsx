import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STAT_COLORS, StatType } from "@/app/constants/colors";

type DayData = {
  day?: number;
  type: 'prev' | 'current' | 'next' | 'total';
  hours: {
    consulting: number;
    handsOn: number;
    squad: number;
    internal: number;
  };
}

type DayCellProps = {
  dayData: DayData;
  weekIndex: number;
  dayIndex: number;
  isSelected: boolean;
  selectedColumn: number | null;
  selectedRow: number | null;
  isAllSelected: boolean;
  rowPercentage: string | null;
  columnPercentage: string | null;
  selectedStatType: StatType;
  onDayClick: (day: number, type: 'prev' | 'current' | 'next', weekIndex: number) => void;
}

type TotalCellProps = {
  hours: {
    consulting: number;
    handsOn: number;
    squad: number;
    internal: number;
  };
  index: number;
  selectedRow: number | null;
  selectedColumn: number | null;
  isAllSelected: boolean;
  rowPercentage?: string | null;
  columnPercentage?: string | null;
  grandTotal?: number;
  selectedStatType: StatType;
  onSelect: (index: number) => void;
}

const DayOfWeekTotalCell = ({ hours, index, grandTotal, selectedColumn, isAllSelected, selectedStatType, onSelect }: TotalCellProps) => {
  const statHours = hours[selectedStatType];
  
  return (
    <div
      onClick={() => onSelect(index)}
      className={`
        p-2 text-center bg-gray-50 flex items-center justify-center relative h-[70px] border-r border-gray-200 last:border-r-0 cursor-pointer
        ${selectedColumn === index || isAllSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
      `}
    >
      {statHours > 0 && (
        <>
          {index < 7 && grandTotal && <span className="absolute top-[2px] left-[2px] text-[8px] text-gray-500">{((statHours / grandTotal) * 100).toFixed(1)}%</span>}
          <span style={{color: STAT_COLORS[selectedStatType]}}>{statHours}h</span>
        </>
      )}
    </div>
  );
};

const WeekTotalCell = ({
  hours,
  index,
  selectedRow,
  isAllSelected,
  rowPercentage,
  columnPercentage,
  selectedStatType,
  onSelect
}: TotalCellProps) => {
  const statHours = hours[selectedStatType];

  return (
    <div
      onClick={() => onSelect(index)}
      className={`
        p-2 text-center relative h-[70px] flex flex-col justify-between cursor-pointer
        border-b border-r border-gray-200 last:border-r-0 last:border-b-0
        bg-gray-50
        ${selectedRow === index || isAllSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
      `}
    >
      {statHours > 0 && (
        <>
          {rowPercentage && <span className="absolute top-[2px] left-[2px] text-[8px] text-gray-500">{rowPercentage}%</span>}
          <span style={{color: STAT_COLORS[selectedStatType]}} className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">{statHours}h</span>
          {columnPercentage && <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">{columnPercentage}%</span>}
        </>
      )}
    </div>
  );
};

const DayCell = ({
  dayData,
  weekIndex,
  dayIndex,
  isSelected,
  selectedColumn,
  selectedRow,
  isAllSelected,
  rowPercentage,
  columnPercentage,
  selectedStatType,
  onDayClick
}: DayCellProps) => {
  const { type, hours } = dayData;
  const day = 'day' in dayData ? dayData.day : undefined;
  const statHours = hours[selectedStatType];

  const isSelectable = type === 'current' && statHours > 0;
  const isHighlighted = isSelected || selectedColumn === dayIndex || selectedRow === weekIndex || isAllSelected;

  return (
    <div
      onClick={() => {
        if (isSelectable && day !== undefined) {
          onDayClick(day, type, weekIndex);
        }
      }}
      className={`
        p-2 text-center transition-colors relative h-[70px] flex flex-col justify-between
        border-b border-r border-gray-200 last:border-r-0 last:border-b-0
        ${isSelectable ? 'cursor-pointer hover:bg-gray-100' : ''}
        ${type === 'current' ? '' : type === 'total' ? 'bg-gray-50' : 'text-gray-400'}
        ${isHighlighted ? 'ring-2 ring-blue-500 ring-inset' : ''}
      `}
    >
      {rowPercentage && <span className="absolute top-[2px] left-[2px] text-[8px] text-gray-500">{rowPercentage}%</span>}
      <span className="absolute top-[15px] left-1/2 transform -translate-x-1/2 text-[12px]">{day}</span>
      {statHours > 0 && (
        <>
          <span style={{color: type === 'current' ? STAT_COLORS[selectedStatType] : '#9CA3AF'}} className="absolute bottom-[15px] left-1/2 transform -translate-x-1/2 block">{statHours}h</span>
          {columnPercentage && <span className="absolute bottom-[2px] right-[2px] text-[8px] text-gray-500">{columnPercentage}%</span>}
        </>
      )}
    </div>
  );
};

interface AllocationCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  selectedRow: number | null;
  setSelectedRow: (row: number | null) => void;
  selectedColumn: number | null;
  setSelectedColumn: (column: number | null) => void;
  isAllSelected: boolean;
  setIsAllSelected: (selected: boolean) => void;
  timesheet: any;
}

export function AllocationCalendar({
  selectedDate,
  setSelectedDate,
  selectedDay,
  setSelectedDay,
  selectedRow,
  setSelectedRow,
  selectedColumn,
  setSelectedColumn,
  isAllSelected,
  setIsAllSelected,
  timesheet
}: AllocationCalendarProps) {
  const [selectedStatType, setSelectedStatType] = useState<StatType>('consulting');

  const getHoursForDate = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const dayData = timesheet.byDate.find((d: { date: string }) => d.date === formattedDate);
    return {
      consulting: dayData?.totalConsultingHours || 0,
      handsOn: dayData?.totalHandsOnHours || 0,
      squad: dayData?.totalSquadHours || 0,
      internal: dayData?.totalInternalHours || 0
    };
  };

  const handleDayClick = (day: number, type: 'prev' | 'current' | 'next', rowIndex: number) => {
    if (type === 'prev') {
      const newDate = new Date(selectedDate);
      newDate.setMonth(selectedDate.getMonth() - 1);
      newDate.setDate(day);
      setSelectedDate(newDate);
    } else if (type === 'next') {
      const newDate = new Date(selectedDate);
      newDate.setMonth(selectedDate.getMonth() + 1);
      newDate.setDate(day);
      setSelectedDate(newDate);
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    }
    setSelectedDay(day);
    setSelectedRow(null);
    setSelectedColumn(null);
    setIsAllSelected(false);
  };

  const handleColumnSelect = (columnIndex: number) => {
    if (columnIndex === 7) {
      setIsAllSelected(true);
      setSelectedColumn(null);
      setSelectedRow(null);
      setSelectedDay(null);
    } else {
      setSelectedColumn(columnIndex);
      setSelectedRow(null);
      setSelectedDay(null);
      setIsAllSelected(false);
    }
  };

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedColumn(null);
    setSelectedDay(null);
    setIsAllSelected(false);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + increment);
    setSelectedDate(newDate);
    setSelectedDay(null);
    setSelectedRow(null);
    setSelectedColumn(null);
    setIsAllSelected(false);
  };

  const handleStatTypeChange = (newType: StatType) => {
    setSelectedStatType(newType);
    setSelectedDay(null);
    setSelectedRow(null);
    setSelectedColumn(null);
    setIsAllSelected(false);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate total hours for each type
  const totalHours = {
    consulting: 0,
    handsOn: 0,
    squad: 0,
    internal: 0
  };

  timesheet.byDate.forEach((day: { 
    totalConsultingHours?: number;
    totalHandsOnHours?: number; 
    totalSquadHours?: number;
    totalInternalHours?: number;
  }) => {
    totalHours.consulting += day.totalConsultingHours || 0;
    totalHours.handsOn += day.totalHandsOnHours || 0;
    totalHours.squad += day.totalSquadHours || 0;
    totalHours.internal += day.totalInternalHours || 0;
  });

  return (
    <div className="w-full lg:w-1/2 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => handleMonthChange(-1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          ←
        </button>
        <span className="text-lg font-semibold">
          {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </span>
        <button 
          onClick={() => handleMonthChange(1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          →
        </button>
      </div>

      <Tabs defaultValue="consulting" className="mb-4">
        <TabsList className="w-full">
          {totalHours.consulting > 0 && (
            <TabsTrigger value="consulting" onClick={() => handleStatTypeChange('consulting')} className="flex-1">Consulting</TabsTrigger>
          )}
          {totalHours.handsOn > 0 && (
            <TabsTrigger value="handsOn" onClick={() => handleStatTypeChange('handsOn')} className="flex-1">Hands-on</TabsTrigger>
          )}
          {totalHours.squad > 0 && (
            <TabsTrigger value="squad" onClick={() => handleStatTypeChange('squad')} className="flex-1">Squad</TabsTrigger>
          )}
          {totalHours.internal > 0 && (
            <TabsTrigger value="internal" onClick={() => handleStatTypeChange('internal')} className="flex-1">Internal</TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-8 border border-gray-200">
        {/* Header row with day names */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Total'].map((day, index) => (
          <div 
            key={day}
            onClick={() => handleColumnSelect(index)}
            className={`
              text-center p-2 text-sm font-semibold text-gray-600 border-b border-r border-gray-200 last:border-r-0 h-[70px] 
              flex items-center justify-center cursor-pointer
              ${(selectedColumn === index && !isAllSelected) || (isAllSelected) ? 'ring-2 ring-blue-500 ring-inset' : ''}
            `}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {(() => {
          const currentMonth = selectedDate.getMonth();
          const currentYear = selectedDate.getFullYear();
          
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
          const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
          
          const daysInMonth = lastDayOfMonth.getDate();
          const startingDayOfWeek = firstDayOfMonth.getDay();

          // Calculate total days needed to ensure first and last rows have current month dates
          const totalDays = startingDayOfWeek + daysInMonth;
          const weeksNeeded = Math.ceil(totalDays / 7);
          const totalCells = weeksNeeded * 7;

          // Get last few days of previous month only if needed
          const previousMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => {
            const date = new Date(currentYear, currentMonth, -i);
            return {
              day: date.getDate(),
              type: 'prev' as const,
              hours: getHoursForDate(date)
            };
          }).reverse();

          // Current month days
          const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(currentYear, currentMonth, i + 1);
            return {
              day: i + 1,
              type: 'current' as const,
              hours: getHoursForDate(date)
            };
          });

          // Next month days to fill remaining cells
          const remainingDays = totalCells - (previousMonthDays.length + currentMonthDays.length);
          const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
            const date = new Date(currentYear, currentMonth + 1, i + 1);
            return {
              day: i + 1,
              type: 'next' as const,
              hours: getHoursForDate(date)
            };
          });

          const allDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];

          const rows = Array.from({ length: weeksNeeded }, (_, weekIndex) => {
            const weekDays = allDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
            const weekTotal = {
              consulting: 0,
              handsOn: 0,
              squad: 0,
              internal: 0
            };
            weekDays.forEach(({ hours, type }) => {
              if (type === 'current') {
                weekTotal.consulting += hours.consulting;
                weekTotal.handsOn += hours.handsOn;
                weekTotal.squad += hours.squad;
                weekTotal.internal += hours.internal;
              }
            });
            return [...weekDays, { type: 'total' as const, hours: weekTotal }];
          });

          // Calculate column totals (only for current month)
          const columnTotals = Array(8).fill(null).map(() => ({
            consulting: 0,
            handsOn: 0,
            squad: 0,
            internal: 0
          }));

          rows.forEach(week => {
            week.forEach((day, index) => {
              if (day.type === 'current' || day.type === 'total') {
                columnTotals[index].consulting += day.hours.consulting;
                columnTotals[index].handsOn += day.hours.handsOn;
                columnTotals[index].squad += day.hours.squad;
                columnTotals[index].internal += day.hours.internal;
              }
            });
          });

          return (
            <>
              {rows.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {week.slice(0, 7).map((dayData, dayIndex) => {
                    const isSelected = 'day' in dayData && dayData.day !== undefined && selectedDay === dayData.day && 
                      ((dayData.type === 'current' && selectedDate.getMonth() === currentMonth) ||
                       (dayData.type === 'prev' && selectedDate.getMonth() === currentMonth - 1) ||
                       (dayData.type === 'next' && selectedDate.getMonth() === currentMonth + 1));
                    
                    const weekTotal = week[7].hours[selectedStatType];
                    const columnTotal = columnTotals[dayIndex][selectedStatType];
                    
                    // Calculate percentages only for current month cells with hours
                    const rowPercentage = dayData.type === 'current' && dayData.hours[selectedStatType] > 0 && weekTotal > 0 
                      ? ((dayData.hours[selectedStatType] || 0) / weekTotal * 100).toFixed(1) 
                      : null;
                    const columnPercentage = dayData.type === 'current' && dayData.hours[selectedStatType] > 0 && columnTotal > 0 
                      ? ((dayData.hours[selectedStatType] || 0) / columnTotal * 100).toFixed(1) 
                      : null;
                    
                    return (
                      <DayCell
                        key={`${weekIndex}-${dayIndex}`}
                        dayData={dayData}
                        weekIndex={weekIndex}
                        dayIndex={dayIndex}
                        isSelected={isSelected}
                        selectedColumn={selectedColumn}
                        selectedRow={selectedRow}
                        isAllSelected={isAllSelected}
                        rowPercentage={rowPercentage}
                        columnPercentage={columnPercentage}
                        selectedStatType={selectedStatType}
                        onDayClick={handleDayClick}
                      />
                    );
                  })}
                  <WeekTotalCell
                    hours={week[7].hours}
                    index={weekIndex}
                    selectedRow={selectedRow}
                    selectedColumn={null}
                    isAllSelected={isAllSelected}
                    columnPercentage={week[7].hours[selectedStatType] > 0 ? ((week[7].hours[selectedStatType] / columnTotals[7][selectedStatType]) * 100).toFixed(1) : null}
                    selectedStatType={selectedStatType}
                    onSelect={handleRowSelect}
                  />
                </React.Fragment>
              ))}
              {/* Total row */}
              {columnTotals.map((total, index) => (
                <DayOfWeekTotalCell
                  key={`total-${index}`}
                  hours={total}
                  index={index}
                  selectedRow={null}
                  selectedColumn={selectedColumn}
                  isAllSelected={isAllSelected}
                  grandTotal={columnTotals[7][selectedStatType]}
                  selectedStatType={selectedStatType}
                  onSelect={handleColumnSelect}
                />
              ))}
            </>
          );
        })()}
      </div>
    </div>
  );
} 