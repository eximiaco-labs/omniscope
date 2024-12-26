"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DailyData } from "./forecastData";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { formatCurrency } from "./utils";
import React from "react";
import SectionHeader from "@/components/SectionHeader";

interface GraphVizDailyProps {
  data: DailyData[];
}

export const GraphVizDaily: React.FC<GraphVizDailyProps> = ({ data }) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("actual");
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
    <div className="mt-8">
      <SectionHeader title="Daily Forecast" subtitle="" />
      <ChartContainer config={chartConfig} className="ml-2 mr-2">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 12, bottom: 5, left: 12 }}
          accessibilityLayer
        >
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
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
