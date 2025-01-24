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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TableCellComponent } from "../revenue-forecast/components/TableCell";
import SectionHeader from "@/components/SectionHeader";
import { STAT_COLORS } from "@/app/constants/colors";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const YEARLY_FORECAST_QUERY = gql`
  query YearlyForecast($year: Int!) {
    financial {
      yearlyRevenueForecast(year: $year) {
        year
        goal
        workingDays
        realizedWorkingDays
        byMonth {
          data {
            month
            goal
            workingDays
            expectedConsultingFee
            expectedConsultingPreFee
            expectedHandsOnFee
            expectedSquadFee
            actual
            actualConsultingFee
            actualConsultingPreFee
            actualHandsOnFee
            actualSquadFee
          }
        }
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
    actual: number;
    actualConsultingFee: number;
    actualConsultingPreFee: number;
    actualHandsOnFee: number;
    actualSquadFee: number;
  }[];
  forecast: {
    goal: number;
    year: number;
  };
}

const ForecastTable = ({ months, forecast }: ForecastTableProps) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

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

  const totalActualConsultingFee = months.reduce(
    (sum, month) => sum + month.actualConsultingFee,
    0
  );
  const totalActualConsultingPreFee = months.reduce(
    (sum, month) => sum + month.actualConsultingPreFee,
    0
  );

  const totalActualHandsOnFee = months.reduce(
    (sum, month) => sum + month.actualHandsOnFee,
    0
  );
  
  const totalActualSquadFee = months.reduce(
    (sum, month) => sum + month.actualSquadFee,
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

  function isMonthInPast(month: number) {
    if (month === 12) {
      return currentYear > 2024 || (currentYear === 2024 && currentMonth >= 12);
    }
    return currentYear > 2025 || (currentYear === 2025 && currentMonth >= month);
  }

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
        <TableRow className="h-[57px] border-b-[1px] font-bold">
          <TableCell className="border-r border-gray-400">
            Actual
          </TableCell>
          {months.map((month, idx) => (
            <TableCellComponent
              key={month.month}
              value={isMonthInPast(month.month) ? month.actual : 0}
              normalizedValue={isMonthInPast(month.month) ? month.actual : 0}
              previousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actual : 0) : undefined}
              normalizedPreviousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actual : 0) : undefined}
              normalized={false}
              className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
            />
          ))}
          <TableCellComponent
            value={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
            normalizedValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
            normalized={false}
            className="border-x border-gray-400"
          />
        </TableRow>
        {totalActualConsultingFee > 0 && (
          <TableRow className="h-[57px] border-b-[1px]">
            <TableCell className="border-r border-gray-400 pl-8">
              Consulting
            </TableCell>
            {months.map((month, idx) => (
              <TableCellComponent
                key={month.month}
                value={isMonthInPast(month.month) ? month.actualConsultingFee : 0}
                normalizedValue={isMonthInPast(month.month) ? month.actualConsultingFee : 0}
                totalValue={isMonthInPast(month.month) ? month.actual : 0}
                normalizedTotalValue={isMonthInPast(month.month) ? month.actual : 0}
                previousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualConsultingFee : 0) : undefined}
                normalizedPreviousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualConsultingFee : 0) : undefined}
                normalized={false}
                className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
              />
            ))}
            <TableCellComponent
              value={totalActualConsultingFee}
              normalizedValue={totalActualConsultingFee}
              totalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalizedTotalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalized={false}
              className="border-x border-gray-400"
            />
          </TableRow>
        )}
        {totalActualConsultingPreFee > 0 && (
          <TableRow className="h-[57px] border-b-[1px]">
            <TableCell className="border-r border-gray-400 pl-8">
              Pre-Contracted Consulting
            </TableCell>
            {months.map((month, idx) => (
              <TableCellComponent
                key={month.month}
                value={isMonthInPast(month.month) ? month.actualConsultingPreFee : 0}
                normalizedValue={isMonthInPast(month.month) ? month.actualConsultingPreFee : 0}
                totalValue={isMonthInPast(month.month) ? month.actual : 0}
                normalizedTotalValue={isMonthInPast(month.month) ? month.actual : 0}
                previousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualConsultingPreFee : 0) : undefined}
                normalizedPreviousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualConsultingPreFee : 0) : undefined}
                normalized={false}
                className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
              />
            ))}
            <TableCellComponent
              value={totalActualConsultingPreFee}
              normalizedValue={totalActualConsultingPreFee}
              totalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalizedTotalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalized={false}
              className="border-x border-gray-400"
            />
          </TableRow>
        )}
        {totalActualHandsOnFee > 0 && (
          <TableRow className="h-[57px] border-b-[1px]">
            <TableCell className="border-r border-gray-400 pl-8">
              Hands-On
            </TableCell>
            {months.map((month, idx) => (
              <TableCellComponent
                key={month.month}
                value={isMonthInPast(month.month) ? month.actualHandsOnFee : 0}
                normalizedValue={isMonthInPast(month.month) ? month.actualHandsOnFee : 0}
                totalValue={isMonthInPast(month.month) ? month.actual : 0}
                normalizedTotalValue={isMonthInPast(month.month) ? month.actual : 0}
                previousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualHandsOnFee : 0) : undefined}
                normalizedPreviousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualHandsOnFee : 0) : undefined}
                normalized={false}
                className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
              />
            ))}
            <TableCellComponent
              value={totalActualHandsOnFee}
              normalizedValue={totalActualHandsOnFee}
              totalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalizedTotalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalized={false}
              className="border-x border-gray-400"
            />
          </TableRow>
        )}
        {totalActualSquadFee > 0 && (
          <TableRow className="h-[57px] border-b-[1px]">
            <TableCell className="border-r border-gray-400 pl-8">
              Squad
            </TableCell>
            {months.map((month, idx) => (
              <TableCellComponent
                key={month.month}
                value={isMonthInPast(month.month) ? month.actualSquadFee : 0}
                normalizedValue={isMonthInPast(month.month) ? month.actualSquadFee : 0}
                totalValue={isMonthInPast(month.month) ? month.actual : 0}
                normalizedTotalValue={isMonthInPast(month.month) ? month.actual : 0}
                previousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualSquadFee : 0) : undefined}
                normalizedPreviousValue={idx > 0 ? (isMonthInPast(months[idx - 1].month) ? months[idx - 1].actualSquadFee : 0) : undefined}
                normalized={false}
                className={`border-x border-gray-400 ${month.month === currentMonth ? 'bg-blue-50' : ''}`}
              />
            ))}
            <TableCellComponent
              value={totalActualSquadFee}
              normalizedValue={totalActualSquadFee}
              totalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalizedTotalValue={months.reduce((sum, month) => sum + (isMonthInPast(month.month) ? month.actual : 0), 0)}
              normalized={false}
              className="border-x border-gray-400"
            />
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

function formatMillions(value: number): string {
  return `${(value / 1000000).toFixed(1)}M`;
}

export default function YearlyForecast2025() {
  const client = useEdgeClient();
  const { data, loading, error } = useQuery(YEARLY_FORECAST_QUERY, {
    variables: { year: 2025 },
    client: client ?? undefined,
    ssr: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  const forecast = data?.financial?.yearlyRevenueForecast;
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  function isMonthInPast(month: number) {
    if (month === 12) {
      return currentYear > 2024 || (currentYear === 2024 && currentMonth > 12);
    }
    return currentYear > 2025 || (currentYear === 2025 && currentMonth > month);
  }

  // Calculate monthly data for the chart
  const monthlyData = forecast.byMonth.data.map((month: any) => {
    const isPast = isMonthInPast(month.month);
    
    // For past months, use actual values, for current and future months use expected values
    const consultingValue = isPast ? month.actualConsultingFee : month.expectedConsultingFee;
    const consultingPreValue = isPast ? month.actualConsultingPreFee : month.expectedConsultingPreFee;
    const handsOnValue = isPast ? month.actualHandsOnFee : month.expectedHandsOnFee;
    const squadValue = isPast ? month.actualSquadFee : month.expectedSquadFee;
    
    return {
      month: monthNames[month.month - 1],
      consulting: consultingValue,
      consultingPre: consultingPreValue,
      handsOn: handsOnValue,
      squad: squadValue,
      total: consultingValue + consultingPreValue + handsOnValue + squadValue,
      isCurrentMonth: currentYear === 2025 && currentMonth === month.month
    };
  });

  // Calculate accumulated data
  const accumulatedData = monthlyData.reduce((acc: any[], curr: {
    month: string;
    consulting: number;
    consultingPre: number;
    handsOn: number;
    squad: number;
    total: number;
    isCurrentMonth: boolean;
  }, idx: number) => {
    const previous = idx > 0 ? acc[idx - 1] : {
      consulting: 0,
      consultingPre: 0,
      handsOn: 0,
      squad: 0,
      total: 0
    };

    acc.push({
      month: curr.month,
      consulting: previous.consulting + curr.consulting,
      consultingPre: previous.consultingPre + curr.consultingPre,
      handsOn: previous.handsOn + curr.handsOn,
      squad: previous.squad + curr.squad,
      total: previous.total + curr.total,
      isCurrentMonth: curr.isCurrentMonth
    });

    return acc;
  }, []);

  const chartConfig = {
    consulting: {
      label: "Consulting",
      color: STAT_COLORS.consulting,
    },
    consultingPre: {
      label: "Pre-Contracted Consulting",
      color: STAT_COLORS.consulting,
    },
    handsOn: {
      label: "Hands-On",
      color: STAT_COLORS.handsOn,
    },
    squad: {
      label: "Squad",
      color: STAT_COLORS.squad,
    },
  };

  const getSeriesLabel = (name: string): string => {
    const key = name as keyof typeof chartConfig;
    return chartConfig[key]?.label || name;
  };

  const totalActual = forecast.byMonth.data.reduce((sum: number, month: any) => {
    const isPast = isMonthInPast(month.month);
    const isCurrentMonth = currentYear === 2025 && currentMonth === month.month;
    return sum + ((isPast || isCurrentMonth) ? (
      month.actualConsultingFee +
      month.actualConsultingPreFee +
      month.actualHandsOnFee +
      month.actualSquadFee
    ) : 0);
  }, 0);
  const remaining = forecast.goal - totalActual;

  const firstHalf = forecast.byMonth.data.slice(0, 6);
  const secondHalf = forecast.byMonth.data.slice(6, 12);

  // Get the expected annual total from the last month's accumulated value
  const expectedAnnual = accumulatedData[accumulatedData.length - 1].total;

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">
        Yearly Forecast {forecast.year}
      </h2>
      
      <div className="grid grid-cols-5 gap-4 mb-8 text-center">
        <div className="p-4 bg-white border border-black rounded-lg">
          <div className="text-lg text-gray-900">Annual Goal</div>
          <div className="text-2xl font-bold text-black">{formatCurrency(forecast.goal)}</div>
        </div>
        <div className="p-4 bg-white border border-black rounded-lg">
          <div className="text-lg text-gray-900">Realized</div>
          <div className="text-2xl font-bold text-black">
            {formatCurrency(totalActual)}
            <div className="text-sm">
              {((totalActual / forecast.goal) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-black rounded-lg">
          <div className="text-lg text-gray-900">Expected (Annual)</div>
          <div className="text-2xl font-bold text-black">
            {formatCurrency(expectedAnnual)}
            <div className="text-sm">
              {((expectedAnnual / forecast.goal) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-black rounded-lg">
          <div className="text-lg text-gray-900">Working Days</div>
          <div className="text-2xl font-bold text-black">
            {forecast.realizedWorkingDays}/{forecast.workingDays}
            <div className="text-sm">
              {((forecast.realizedWorkingDays / forecast.workingDays) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-black rounded-lg">
          <div className="text-lg text-gray-900">Remaining</div>
          <div className="text-2xl font-bold text-black">
            {formatCurrency(remaining)}
            <div className="text-sm">
              {((remaining / forecast.goal) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-lg font-medium mb-2">Monthly Revenue</div>
          <div className="w-full h-[400px]">
            <AreaChart
              width={550}
              height={400}
              data={monthlyData}
              margin={{
                left: 12,
                right: 24,
                top: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => value.slice(0, 3)}
                style={{ fontSize: '10px' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => formatMillions(value)}
                style={{ fontSize: '10px' }}
              />
              <Tooltip
                cursor={false}
                formatter={(value: number, name: string) => [formatCurrency(value), getSeriesLabel(name)]}
                labelFormatter={(label: string) => {
                  const monthData = monthlyData.find((m: { month: string; isCurrentMonth: boolean; total: number }) => m.month === label);
                  return `${label}${monthData?.isCurrentMonth ? ' (Current)' : ''}\nTotal: ${formatCurrency(monthData?.total || 0)}`;
                }}
                contentStyle={{ fontSize: '12px', whiteSpace: 'pre-line' }}
              />
              <Area
                dataKey="squad"
                type="monotone"
                fill={chartConfig.squad.color}
                fillOpacity={0.6}
                stroke={chartConfig.squad.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.squad.label}
              />
              <Area
                dataKey="handsOn"
                type="monotone"
                fill={chartConfig.handsOn.color}
                fillOpacity={0.6}
                stroke={chartConfig.handsOn.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.handsOn.label}
              />
              <Area
                dataKey="consultingPre"
                type="monotone"
                fill={chartConfig.consultingPre.color}
                fillOpacity={0.4}
                stroke={chartConfig.consultingPre.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.consultingPre.label}
              />
              <Area
                dataKey="consulting"
                type="monotone"
                fill={chartConfig.consulting.color}
                fillOpacity={0.2}
                stroke={chartConfig.consulting.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.consulting.label}
              />
            </AreaChart>
          </div>
        </div>
        <div>
          <div className="text-lg font-medium mb-2">Accumulated Revenue</div>
          <div className="w-full h-[400px]">
            <AreaChart
              width={550}
              height={400}
              data={accumulatedData}
              margin={{
                left: 12,
                right: 24,
                top: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => value.slice(0, 3)}
                style={{ fontSize: '10px' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => formatMillions(value)}
                style={{ fontSize: '10px' }}
              />
              <Tooltip
                cursor={false}
                formatter={(value: number, name: string) => [formatCurrency(value), getSeriesLabel(name)]}
                labelFormatter={(label: string) => {
                  const monthData = accumulatedData.find((m: { month: string; isCurrentMonth: boolean; total: number }) => m.month === label);
                  const isLastMonth = label === monthNames[11];
                  return `${label}${monthData?.isCurrentMonth ? ' (Current)' : ''}\nTotal${isLastMonth ? ' (Expected)' : ''}: ${formatCurrency(monthData?.total || 0)}`;
                }}
                contentStyle={{ fontSize: '12px', whiteSpace: 'pre-line' }}
              />
              <Area
                dataKey="squad"
                type="monotone"
                fill={chartConfig.squad.color}
                fillOpacity={0.6}
                stroke={chartConfig.squad.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.squad.label}
              />
              <Area
                dataKey="handsOn"
                type="monotone"
                fill={chartConfig.handsOn.color}
                fillOpacity={0.6}
                stroke={chartConfig.handsOn.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.handsOn.label}
              />
              <Area
                dataKey="consultingPre"
                type="monotone"
                fill={chartConfig.consultingPre.color}
                fillOpacity={0.4}
                stroke={chartConfig.consultingPre.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.consultingPre.label}
              />
              <Area
                dataKey="consulting"
                type="monotone"
                fill={chartConfig.consulting.color}
                fillOpacity={0.2}
                stroke={chartConfig.consulting.color}
                strokeWidth={2}
                stackId="a"
                name={chartConfig.consulting.label}
              />
            </AreaChart>
          </div>
        </div>
      </div>

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
