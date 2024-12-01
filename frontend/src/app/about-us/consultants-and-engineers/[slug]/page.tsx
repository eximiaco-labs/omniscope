"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CONSULTANT, Consultant } from "./queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import React from "react";

export default function ConsultantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Calculate visible dates for dataset
  const getVisibleDates = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const firstVisibleDate = new Date(currentYear, currentMonth, -startingDayOfWeek + 1);

    const daysInMonth = lastDayOfMonth.getDate();
    const totalDays = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    const remainingDays = (weeksNeeded * 7) - (startingDayOfWeek + daysInMonth);
    
    const lastVisibleDate = new Date(currentYear, currentMonth + 1, remainingDays);

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    return `${formatDate(firstVisibleDate)}-${formatDate(lastVisibleDate)}`;
  };

  const selectedDataset = getVisibleDates();

  const { data, loading, error } = useQuery<{ consultantOrEngineer: Consultant }>(
    GET_CONSULTANT,
    {
      variables: { 
        slug,
        dataset: selectedDataset
      }
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.consultantOrEngineer) return <div>Consultant not found</div>;

  const { name, position, photoUrl, timesheet } = data.consultantOrEngineer;

  const getHoursForDate = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const dayData = timesheet.byDate.find(d => d.date === formattedDate);
    return dayData?.totalHours || 0;
  };

  const handleDayClick = (day: number, type: string, rowIndex: number) => {
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
    setSelectedRow(rowIndex);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + increment);
    setSelectedDate(newDate);
    setSelectedDay(null);
    setSelectedRow(null);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600">{position}</p>
        </div>
      </div>

      <SectionHeader title="Allocation Calendar" subtitle=""/>

      <div className="w-full lg:w-1/2">
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
        <div className="grid grid-cols-8 border border-gray-200">
          {/* Header row with day names */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Total'].map((day) => (
            <div 
              key={day}
              className="text-center p-2 text-sm font-semibold text-gray-600 border-b border-r border-gray-200 last:border-r-0"
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
                type: 'prev',
                hours: getHoursForDate(date)
              };
            }).reverse();

            // Current month days
            const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
              const date = new Date(currentYear, currentMonth, i + 1);
              return {
                day: i + 1,
                type: 'current',
                hours: getHoursForDate(date)
              };
            });

            // Next month days to fill remaining cells
            const remainingDays = totalCells - (previousMonthDays.length + currentMonthDays.length);
            const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
              const date = new Date(currentYear, currentMonth + 1, i + 1);
              return {
                day: i + 1,
                type: 'next',
                hours: getHoursForDate(date)
              };
            });

            const allDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];

            const rows = Array.from({ length: weeksNeeded }, (_, weekIndex) => {
              const weekDays = allDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
              const weekTotal = weekDays.reduce((sum, { hours, type }) => {
                // Only include hours from current month in total
                return sum + (type === 'current' ? hours : 0);
              }, 0);
              return [...weekDays, { type: 'total', hours: weekTotal }];
            });

            // Calculate column totals (only for current month)
            const columnTotals = Array(8).fill(0);
            rows.forEach(week => {
              week.forEach((day, index) => {
                if (day.type === 'current' || day.type === 'total') {
                  columnTotals[index] += day.hours || 0;
                }
              });
            });

            return (
              <>
                {rows.map((week, weekIndex) => (
                  <React.Fragment key={weekIndex}>
                    {week.map((dayData, dayIndex) => {
                      const { type, hours } = dayData;
                      const day = 'day' in dayData ? dayData.day : null;
                      const isSelected = day !== null && selectedDay === day && 
                        ((type === 'current' && selectedDate.getMonth() === currentMonth) ||
                         (type === 'prev' && selectedDate.getMonth() === currentMonth - 1) ||
                         (type === 'next' && selectedDate.getMonth() === currentMonth + 1));
                      
                      const weekTotal = week[7].hours;
                      const columnTotal = columnTotals[dayIndex];
                      
                      // Only calculate percentages for current month days
                      const showPercentages = type === 'current' && hours > 0;
                      const rowPercentage = showPercentages && weekTotal > 0 ? ((hours || 0) / weekTotal * 100).toFixed(1) : null;
                      const columnPercentage = showPercentages && columnTotal > 0 ? ((hours || 0) / columnTotal * 100).toFixed(1) : null;
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          onClick={() => type !== 'total' && handleDayClick(day, type, weekIndex)}
                          className={`
                            p-2 text-center cursor-pointer transition-colors relative min-h-[70px] flex flex-col justify-between
                            border-b border-r border-gray-200 last:border-r-0 last:border-b-0
                            ${type === 'current' ? 'hover:bg-gray-100' : type === 'total' ? 'bg-gray-50' : 'text-gray-400 hover:bg-gray-100'}
                            ${isSelected ? 'ring-2 ring-blue-500 ring-inset font-bold' : ''}
                            ${selectedRow === weekIndex ? 'bg-gray-50' : ''}
                          `}
                        >
                          {type !== 'total' && (
                            <>
                              <div className="relative w-full">
                                {rowPercentage && <span className="absolute -top-1 left-0 text-[8px] text-gray-500">{rowPercentage}%</span>}
                                <span className="absolute top-[9px] left-1/2 transform -translate-x-1/2 text-sm">{day}</span>
                              </div>
                              {hours > 0 && (
                                <div className="relative w-full">
                                  <span className={`absolute bottom-[10px] left-1/2 transform -translate-x-1/2 text-[9px] block ${type === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>{hours}h</span>
                                  {columnPercentage && <span className="absolute bottom-0 right-0 text-[8px] text-gray-500">{columnPercentage}%</span>}
                                </div>
                              )}
                            </>
                          )}
                          {type === 'total' && hours > 0 && (
                            <>
                              <span className="absolute top-[9px] left-1/2 transform -translate-x-1/2 text-[9px] text-blue-600">{hours}h</span>
                              <span className="absolute bottom-0 right-0 text-[8px] text-gray-500">{columnPercentage}%</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
                {/* Total row */}
                {columnTotals.map((total, index) => (
                  <div
                    key={`total-${index}`}
                    className="p-2 text-center bg-gray-50 flex flex-col items-center justify-center relative min-h-[50px] border-r border-gray-200 last:border-r-0"
                  >
                    {total > 0 && (
                      <>
                        <span className="absolute top-[9px] left-1/2 transform -translate-x-1/2 text-[9px] text-blue-600">{total}h</span>
                        {index < 7 && <span className="absolute bottom-0 left-0 text-[8px] text-gray-500">{((total / columnTotals[7]) * 100).toFixed(1)}%</span>}
                      </>
                    )}
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
