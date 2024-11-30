"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CONSULTANT, Consultant } from "./queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { TimesheetSummary } from "../../account-managers/[slug]/TimesheetSummary";
import { CasesSummary } from "../../account-managers/[slug]/CasesSummary";
import React from "react";

export default function ConsultantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDataset, setSelectedDataset] = useState("timesheet-this-month");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data, loading, error } = useQuery<{ consultantOrEngineer: Consultant }>(
    GET_CONSULTANT,
    {
      variables: { 
        slug,
        dataset: selectedDataset.replace('timesheet-', '')
      }
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.consultantOrEngineer) return <div>Consultant not found</div>;

  const { name, position, photoUrl } = data.consultantOrEngineer;

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

      <TimesheetSummary 
        timesheet={data.consultantOrEngineer.timesheet}
        selectedDataset={selectedDataset}
        onDatasetSelect={setSelectedDataset}
        showWorkersInfo={false}
      />

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
        <div className="grid grid-cols-7 gap-1">
          {/* Header row with day names */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day}
              className="text-center p-2 text-sm font-semibold text-gray-600"
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
            const previousMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => ({
              day: new Date(currentYear, currentMonth, -i).getDate(),
              type: 'prev'
            })).reverse();

            // Current month days
            const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
              day: i + 1,
              type: 'current'
            }));

            // Next month days to fill remaining cells
            const remainingDays = totalCells - (previousMonthDays.length + currentMonthDays.length);
            const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
              day: i + 1,
              type: 'next'
            }));

            const allDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];

            return Array.from({ length: weeksNeeded }, (_, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {allDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map(({ day, type }, dayIndex) => {
                  const isSelected = selectedDay === day && 
                    ((type === 'current' && selectedDate.getMonth() === currentMonth) ||
                     (type === 'prev' && selectedDate.getMonth() === currentMonth - 1) ||
                     (type === 'next' && selectedDate.getMonth() === currentMonth + 1));
                  
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      onClick={() => handleDayClick(day, type, weekIndex)}
                      className={`
                        p-2 text-center cursor-pointer transition-colors
                        ${type === 'current' ? 'hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100'}
                        ${isSelected ? 'border border-blue-500 font-bold' : ''}
                        ${selectedRow === weekIndex ? 'bg-gray-50' : ''}
                      `}
                    >
                      {day}
                    </div>
                  );
                })}
              </React.Fragment>
            ));
          })()}
        </div>
      </div>

    </div>
  );
}
