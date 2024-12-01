"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CONSULTANT, Consultant } from "./queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { AllocationCalendar } from "@/app/components/AllocationCalendar";

export default function ConsultantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);

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

      <AllocationCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        selectedColumn={selectedColumn}
        setSelectedColumn={setSelectedColumn}
        isAllSelected={isAllSelected}
        setIsAllSelected={setIsAllSelected}
        timesheet={timesheet}
      />
    </div>
  );
}
