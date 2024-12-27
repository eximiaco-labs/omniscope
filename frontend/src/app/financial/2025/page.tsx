"use client";

import { useQuery, gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { TableCellComponent } from "../revenue-forecast/components/TableCell";
import SectionHeader from "@/components/SectionHeader";

const YEARLY_FORECAST_QUERY = gql`
  query YearlyForecast($year: Int!) {
    yearlyForecast(year: $year) {
      year
      goal
      byMonth {
        month
        goal
        workingDays
        expectedConsultingFee
        expectedConsultingPreFee
        expectedHandsOnFee
        expectedSquadFee
      }
    }
  }
`;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface ForecastTableProps {
  months: {
    month: number;
    goal: number;
    workingDays: number;
    expectedConsultingFee: number;
    expectedConsultingPreFee: number;
    expectedHandsOnFee: number;
    expectedSquadFee: number;
  }[];
  forecast: {
    goal: number;
  };
}

const ForecastTable = ({ months, forecast }: ForecastTableProps) => {
  const currentMonth = new Date().getMonth() + 1;

  const totalGoal = months.reduce((sum, month) => sum + month.goal, 0);
  const totalWorkingDays = months.reduce(
    (sum, month) => sum + month.workingDays,
    0
  );
  const totalExpectedConsultingFee = months.reduce(
    (sum, month) => sum + month.expectedConsultingFee,
    0
  );
  const totalExpectedConsultingPreFee = months.reduce(
    (sum, month) => sum + month.expectedConsultingPreFee,
    0
  );
  const totalExpectedHandsOnFee = months.reduce(
    (sum, month) => sum + month.expectedHandsOnFee,
    0
  );
  const totalExpectedSquadFee = months.reduce(
    (sum, month) => sum + month.expectedSquadFee,
    0
  );

  const totalExpected = months.map(month => 
    month.expectedConsultingFee + 
    month.expectedConsultingPreFee + 
    month.expectedHandsOnFee + 
    month.expectedSquadFee
  );

  const grandTotalExpected = totalExpectedConsultingFee + 
    totalExpectedConsultingPreFee + 
    totalExpectedHandsOnFee + 
    totalExpectedSquadFee;

  return (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow className="h-[57px]">
          <TableHead rowSpan={2} className="w-[150px] border-r border-gray-400">
            Metrics
          </TableHead>
          {months.map((month) => (
            <TableHead
              key={month.month}
              className={`text-center border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-100' : ''}`}
            >
              {monthNames[month.month - 1]}
              <span className="block text-[10px] text-gray-500">
                {month.workingDays} working days
              </span>
            </TableHead>
          ))}
          <TableHead className="text-center border-x border-gray-400">
            Total
            <span className="block text-[10px] text-gray-500">
              {totalWorkingDays} working days
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="h-[57px] border-b-[1px]">
          <TableCell className="border-r border-gray-400">
            Monthly Goal
          </TableCell>
          {months.map((month) => (
            <TableCellComponent
              key={month.month}
              value={month.goal}
              normalizedValue={month.goal}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={totalGoal}
            normalizedValue={totalGoal}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
        <TableRow className="h-[57px] border-b-[1px] font-bold">
          <TableCell className="border-r border-gray-400">
            Expected
          </TableCell>
          {months.map((month, idx) => (
            <TableCellComponent
              key={month.month}
              value={totalExpected[idx]}
              normalizedValue={totalExpected[idx]}
              totalValue={totalExpected[idx]}
              normalizedTotalValue={totalExpected[idx]}
              previousValue={idx > 0 ? totalExpected[idx - 1] : undefined}
              normalizedPreviousValue={idx > 0 ? totalExpected[idx - 1] : undefined}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={grandTotalExpected}
            normalizedValue={grandTotalExpected}
            totalValue={grandTotalExpected}
            normalizedTotalValue={grandTotalExpected}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
        <TableRow className="h-[57px] border-b-[1px]">
          <TableCell className="border-r border-gray-400 pl-8">
            Consulting
          </TableCell>
          {months.map((month, idx) => (
            <TableCellComponent
              key={month.month}
              value={month.expectedConsultingFee}
              normalizedValue={month.expectedConsultingFee}
              totalValue={totalExpected[idx]}
              normalizedTotalValue={totalExpected[idx]}
              previousValue={idx > 0 ? months[idx - 1].expectedConsultingFee : undefined}
              normalizedPreviousValue={idx > 0 ? months[idx - 1].expectedConsultingFee : undefined}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={totalExpectedConsultingFee}
            normalizedValue={totalExpectedConsultingFee}
            totalValue={grandTotalExpected}
            normalizedTotalValue={grandTotalExpected}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
        <TableRow className="h-[57px] border-b-[1px]">
          <TableCell className="border-r border-gray-400 pl-8">
            Pre-Contracted Consulting
          </TableCell>
          {months.map((month, idx) => (
            <TableCellComponent
              key={month.month}
              value={month.expectedConsultingPreFee}
              normalizedValue={month.expectedConsultingPreFee}
              totalValue={totalExpected[idx]}
              normalizedTotalValue={totalExpected[idx]}
              previousValue={idx > 0 ? months[idx - 1].expectedConsultingPreFee : undefined}
              normalizedPreviousValue={idx > 0 ? months[idx - 1].expectedConsultingPreFee : undefined}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={totalExpectedConsultingPreFee}
            normalizedValue={totalExpectedConsultingPreFee}
            totalValue={grandTotalExpected}
            normalizedTotalValue={grandTotalExpected}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
        <TableRow className="h-[57px] border-b-[1px]">
          <TableCell className="border-r border-gray-400 pl-8">
            Hands-On
          </TableCell>
          {months.map((month, idx) => (
            <TableCellComponent
              key={month.month}
              value={month.expectedHandsOnFee}
              normalizedValue={month.expectedHandsOnFee}
              totalValue={totalExpected[idx]}
              normalizedTotalValue={totalExpected[idx]}
              previousValue={idx > 0 ? months[idx - 1].expectedHandsOnFee : undefined}
              normalizedPreviousValue={idx > 0 ? months[idx - 1].expectedHandsOnFee : undefined}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={totalExpectedHandsOnFee}
            normalizedValue={totalExpectedHandsOnFee}
            totalValue={grandTotalExpected}
            normalizedTotalValue={grandTotalExpected}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
        <TableRow className="h-[57px] border-b-[1px]">
          <TableCell className="border-r border-gray-400 pl-8">
            Squad
          </TableCell>
          {months.map((month, idx) => (
            <TableCellComponent
              key={month.month}
              value={month.expectedSquadFee}
              normalizedValue={month.expectedSquadFee}
              totalValue={totalExpected[idx]}
              normalizedTotalValue={totalExpected[idx]}
              previousValue={idx > 0 ? months[idx - 1].expectedSquadFee : undefined}
              normalizedPreviousValue={idx > 0 ? months[idx - 1].expectedSquadFee : undefined}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={totalExpectedSquadFee}
            normalizedValue={totalExpectedSquadFee}
            totalValue={grandTotalExpected}
            normalizedTotalValue={grandTotalExpected}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default function YearlyForecast2025() {
  const { data, loading, error } = useQuery(YEARLY_FORECAST_QUERY, {
    variables: { year: 2025 },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  const forecast = data?.yearlyForecast;

  const firstHalf = forecast.byMonth.slice(0, 6);
  const secondHalf = forecast.byMonth.slice(6, 12);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">
        Yearly Forecast {forecast.year}
      </h2>
      <p className="text-muted-foreground mb-8">
        Annual Goal: {formatCurrency(forecast.goal)}
      </p>

      <SectionHeader title="First Semester" subtitle="December 2024 to May 2025" />
      <div className="ml-2 mr-2 mb-8">
        <ForecastTable months={firstHalf} forecast={forecast} />
      </div>

      <SectionHeader title="Second Semester" subtitle="June 2025 to December 2025" />
      <div className="ml-2 mr-2">
        <ForecastTable months={secondHalf} forecast={forecast} />
      </div>
    </div>
  );
}
