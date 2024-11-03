'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { DatePicker } from "@/components/DatePicker";
import { PERFORMANCE_ANALYSIS_QUERY } from './query';
import { WeekSummaryCards } from './WeekSummaryCards';

interface Selection {
  weekStart?: string;
  accountManager?: string;
  clientName?: string;
}

export default function PerformanceAnalysisPage() {
  const [selection, setSelection] = useState<Selection>({});
  const [date, setDate] = useState<Date>(new Date());
  
  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const defaultDate = format(date.setDate(1), 'yyyy-MM-dd');
  
  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: defaultDate }
  });

  useEffect(() => {
    if (data?.performanceAnalysis?.weeks?.length > 0) {
      setSelection({ weekStart: data.performanceAnalysis.weeks[0].start });
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const performanceData = data.performanceAnalysis;

  return (
    <div className="p-6">
      <div className="mb-2 flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-4"></div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Performance Analysis</h1>
      
      <div className="space-y-8">
        <WeekSummaryCards 
          performanceData={performanceData}
          selection={selection}
          onSelection={setSelection}
        />
      </div>
    </div>
  );
}
