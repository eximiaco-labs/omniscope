"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { REVENUE_TRACKING_QUERY } from "./query";
import { PreContractedRevenue } from "./components/PreContractedRevenue";
import { RegularRevenue } from "./components/RegularRevenue";
import { Summaries } from "./components/Summaries";

export default function RevenuePage() {
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(REVENUE_TRACKING_QUERY, {
    variables: { date: format(date, "yyyy-MM-dd") }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <div className="ml-2 mr-2">
        <Summaries data={data} date={date} />
        <div className="mt-6">
          <RegularRevenue data={data} date={date} />
        </div>
        <div className="mt-6">
          <PreContractedRevenue data={data} date={date} />
        </div>
      </div>
    </div>
  );
}
