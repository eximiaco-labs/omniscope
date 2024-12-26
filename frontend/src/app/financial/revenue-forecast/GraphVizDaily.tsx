"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DailyData } from "./forecastData";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, TooltipFormatter } from "recharts";
import { formatCurrency } from "./utils";

interface GraphVizDailyProps {
  data: DailyData[];
}

export const GraphVizDaily: React.FC<GraphVizDailyProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    date: new Date(new Date(item.date).getTime() + 86400000).toLocaleDateString(
      "pt-BR",
      { day: "numeric" }
    ),
    expected: item.expected.accTotalConsultingFee,
    actual: item.actual.accTotalConsultingFee,
    difference: item.difference.accTotalConsultingFee,
  }));

  const chartConfig = {
    expected: {
      label: "Expected",
      color: "gray",
    },
    actual: {
      label: "Actual",
      color: "black",
    },
    difference: {
      label: "Balance",
      color: "green",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={chartData}>
        <Line
          type="natural"
          strokeWidth={2}
          dataKey="expected"
          stroke={chartConfig.expected.color}
        />
        <Line
          type="natural"
          strokeWidth={2}
          dataKey="actual"
          stroke={chartConfig.actual.color}
        />
        <Line
          type="natural"
          strokeWidth={2}
          dataKey="difference"
          stroke={chartConfig.difference.color}
        />
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent 
              hideLabel 
              formatter={(v, name) => {
                const result = `${name}: ${formatCurrency(v as number)}`;
                return result;
              }}
            />
          }
        />
      </LineChart>
    </ChartContainer>
  );
};
