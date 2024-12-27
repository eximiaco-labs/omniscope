'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

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

export default function YearlyForecast2025() {
  const { data, loading, error } = useQuery(YEARLY_FORECAST_QUERY, {
    variables: { year: 2025 }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  const forecast = data?.yearlyForecast;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">
            Yearly Forecast {forecast.year}
          </h2>
          <p className="text-muted-foreground">
            Annual Goal: {formatCurrency(forecast.goal)}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Monthly Goal</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Daily Goal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecast.byMonth.map((month: any) => (
                <TableRow key={month.month}>
                  <TableCell>{monthNames[month.month - 1]}</TableCell>
                  <TableCell>{formatCurrency(month.goal)}</TableCell>
                  <TableCell>{month.workingDays}</TableCell>
                  <TableCell>{formatCurrency(month.goal / month.workingDays)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
