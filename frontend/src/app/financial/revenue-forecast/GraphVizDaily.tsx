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
import { CartesianGrid, Line, ComposedChart, XAxis, YAxis, Bar, ReferenceLine, Legend } from "recharts";
import { formatCurrency } from "./utils";
import React from "react";
import SectionHeader from "@/components/SectionHeader";

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
    positiveBalance: item.difference.accTotalConsultingFee >= 0 ? item.difference.accTotalConsultingFee : 0,
    negativeBalance: item.difference.accTotalConsultingFee < 0 ? item.difference.accTotalConsultingFee : 0,
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
      theme: {
        light: "#16a34a", // verde
        dark: "#dc2626", // vermelho
      }
    },
  } satisfies ChartConfig;

  const [highlightedDate, setHighlightedDate] = React.useState<string | null>(null);

  return (
    <div className="mt-8">
      <SectionHeader title="Daily Forecast" subtitle="" />
      <ChartContainer config={chartConfig} className="ml-2 mr-2">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 12, bottom: 5, left: 12 }}
          accessibilityLayer
          onMouseMove={(e) => {
            if (e.activeLabel) {
              setHighlightedDate(e.activeLabel);
            }
          }}
          onMouseLeave={() => setHighlightedDate(null)}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          {highlightedDate && 
          <ReferenceLine 
            x={highlightedDate} 
            stroke="#666" 
            strokeDasharray="3 3"
          />}
          
          {/* Barras para o Balance */}
          <Bar
            dataKey="positiveBalance"
            fill={chartConfig.difference.theme.light}
            fillOpacity={0.8}
            stackId="stack"
          />
          <Bar 
            dataKey="negativeBalance"
            fill={chartConfig.difference.theme.dark}
            fillOpacity={0.8}
            stackId="stack"
          />

          {/* Linhas de Expected e Actual */}
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

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(v, name) => {
                  if (v === undefined || v === null) return false;
                  
                  let label = name;
                  let color = "";

                  if (name === "positiveBalance") {
                    label = "positive";
                    color = chartConfig.difference.theme.light;
                  } else if (name === "negativeBalance") {
                    label = "negative";
                    color = chartConfig.difference.theme.dark;
                  } else if (name === "expected") {
                    color = chartConfig.expected.color;
                  } else if (name === "actual") {
                    color = chartConfig.actual.color;
                  }

                  const value = formatCurrency(v as number);
                  if (value === '0.00') return false;
                  
                  return (
                    <span style={{ color }}>
                      {`${label}: ${value}`}
                    </span>
                  );
                }}
              />
            }
          />
          <Legend 
            formatter={(value) => {
              if (value === "positiveBalance") return "positive";
              if (value === "negativeBalance") return "negative";
              return value;
            }}
            iconType="square"
            align="right"
            verticalAlign="top"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};
