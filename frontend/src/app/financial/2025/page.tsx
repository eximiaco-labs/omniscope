'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { TableCellComponent } from '../revenue-forecast/components/TableCell';
import SectionHeader from '@/components/SectionHeader';

const YEARLY_FORECAST_QUERY = gql`
  query YearlyForecast($year: Int!) {
    yearlyForecast(year: $year) {
      year
      goal
      byMonth {
        month
        goal
        workingDays
      }
    }
  }
`;

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface ForecastTableProps {
  months: {
    month: number;
    goal: number;
    workingDays: number;
  }[];
  forecast: {
    goal: number;
  };
}

const ForecastTable = ({ months, forecast }: ForecastTableProps) => {
  const totalGoal = months.reduce((sum, month) => sum + month.goal, 0);
  const totalWorkingDays = months.reduce((sum, month) => sum + month.workingDays, 0);
  
  return (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow className="h-[57px]">
          <TableHead 
            rowSpan={2} 
            className="w-[150px] border-r border-gray-400"
          >
            Metrics
          </TableHead>
          {months.map((month) => (
            <TableHead 
              key={month.month}
              className="text-center border-x border-gray-400"
            >
              {monthNames[month.month - 1]}
              <span className="block text-[10px] text-gray-500">
                {month.workingDays} working days
              </span>
            </TableHead>
          ))}
          <TableHead 
            className="text-center border-x border-gray-400"
          >
            Total
            <span className="block text-[10px] text-gray-500">
              {totalWorkingDays} working days
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="h-[57px] border-b-[1px]">
          <TableCell className="font-medium border-r border-gray-400">Monthly Goal</TableCell>
          {months.map((month) => (
            <TableCellComponent
              key={month.month}
              value={month.goal}
              normalizedValue={month.goal}
              totalValue={forecast.goal}
              normalizedTotalValue={forecast.goal}
              normalized={false}
              className="border-x border-gray-400"
            />
          ))}
          <TableCellComponent
            value={totalGoal}
            normalizedValue={totalGoal}
            totalValue={forecast.goal}
            normalizedTotalValue={forecast.goal}
            normalized={false}
            className="border-x border-gray-400 font-bold"
          />
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default function YearlyForecast2025() {
  const { data, loading, error } = useQuery(YEARLY_FORECAST_QUERY, {
    variables: { year: 2025 }
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

      <SectionHeader title="First Semester" subtitle="January to June" />
      <div className="ml-2 mr-2 mb-8">
        <ForecastTable months={firstHalf} forecast={forecast} />
      </div>

      <SectionHeader title="Second Semester" subtitle="July to December" />
      <div className="ml-2 mr-2">
        <ForecastTable months={secondHalf} forecast={forecast} />
      </div>
    </div>
  );
}
