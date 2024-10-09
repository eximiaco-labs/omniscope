"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Heading, Subheading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";

const GET_TIMESHEET = gql`
  query GetTimesheet($slug: String!) {
    timesheet(slug: $slug) {
      totalHours
      totalConsultingHours
      totalSquadHours
      totalInternalHours
      uniqueClients
      averageHoursPerClient
      stdDevHoursPerClient
      byClient {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
      }
      uniqueWorkers
      uniqueCases
    }
  }
`;

import { Stat } from "@/app/components/pages/stat";

export default function Datasets() {
  const [timesheetKind, setTimesheetKind] = useState("ALL");
  const { loading, error, data } = useQuery(GET_TIMESHEET, {
    variables: { slug: "timesheet-last-six-weeks" },
  });

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error)
    return (
      <p className="text-center py-5 text-red-500">Error: {error.message}</p>
    );

  const { timesheet } = data;

  return (
    <>
      <Heading>Datasets</Heading>

      <div className="mt-8">
        <Subheading>Working Hours</Subheading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="Total"
            value={
              timesheet.totalHours % 1 === 0
                ? timesheet.totalHours.toFixed(0)
                : timesheet.totalHours.toFixed(1)
            }
          />
          <Stat
            title="Consulting"
            value={
              timesheet.totalConsultingHours % 1 === 0
                ? timesheet.totalConsultingHours.toFixed(0)
                : timesheet.totalConsultingHours.toFixed(1)
            }
            color="#F59E0B"
            total={timesheet.totalHours}
          />
          <Stat
            title="Squad"
            value={
              timesheet.totalSquadHours % 1 === 0
                ? timesheet.totalSquadHours.toFixed(0)
                : timesheet.totalSquadHours.toFixed(1)
            }
            color="#3B82F6"
            total={timesheet.totalHours}
          />
          <Stat
            title="Internal"
            value={
              timesheet.totalInternalHours % 1 === 0
                ? timesheet.totalInternalHours.toFixed(0)
                : timesheet.totalInternalHours.toFixed(1)
            }
            color="#10B981"
            total={timesheet.totalHours}
          />
        </div>
      </div>

      <div className="mt-8">
        <Subheading>Clients</Subheading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            title="Unique Clients"
            value={timesheet.uniqueClients.toString()}
          />
          <Stat
            title="Average Hours per Client"
            value={
              timesheet.averageHoursPerClient % 1 === 0
                ? timesheet.averageHoursPerClient.toFixed(0)
                : timesheet.averageHoursPerClient.toFixed(1)
            }
          />
          <Stat
            title="Std Dev Hours per Client"
            value={
              timesheet.stdDevHoursPerClient % 1 === 0
                ? timesheet.stdDevHoursPerClient.toFixed(0)
                : timesheet.stdDevHoursPerClient.toFixed(1)
            }
          />
        </div>

        <div className="mt-4">
          <div className="h-[400px] border border-gray-200 rounded-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timesheet.byClient}
                layout="horizontal"
                margin={{ top: 80, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tickLine={false}
                  axisLine={{ stroke: "#9CA3AF" }}
                />
                <YAxis
                  type="number"
                  label={{
                    value: "Hours",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                    fill: "#4B5563",
                  }}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    padding: "10px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  formatter={(value, name, props) => {
                    let label;
                    switch (name) {
                      case "totalConsultingHours":
                        label = "Consulting";
                        break;
                      case "totalSquadHours":
                        label = "Squad";
                        break;
                      case "totalInternalHours":
                        label = "Internal";
                        break;
                      default:
                        label = name;
                    }
                    const formattedValue =
                      typeof value === "number"
                        ? value % 1 === 0
                          ? value.toFixed(0)
                          : value.toFixed(1)
                        : value;
                    return [
                      <span
                        style={{ color: "#4B5563", fontWeight: "bold" }}
                      >{`${formattedValue} hours`}</span>,
                      label,
                    ];
                  }}
                  labelFormatter={(label) => (
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#1F2937",
                      }}
                    >
                      {label}
                    </span>
                  )}
                  separator=": "
                />
                <Bar
                  dataKey="totalConsultingHours"
                  name="Consulting"
                  stackId="a"
                  fill="#F59E0B"
                >
                  <animate attributeName="height" from="0" to="100%" dur="1s" />
                </Bar>
                <Bar
                  dataKey="totalSquadHours"
                  name="Squad"
                  stackId="a"
                  fill="#3B82F6"
                >
                  <animate attributeName="height" from="0" to="100%" dur="1s" />
                </Bar>
                <Bar
                  dataKey="totalInternalHours"
                  name="Internal"
                  stackId="a"
                  fill="#10B981"
                >
                  <animate attributeName="height" from="0" to="100%" dur="1s" />
                </Bar>
                <text
                  x="50%"
                  y="50"
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="18"
                  fontWeight="bold"
                >
                  Hours by Client
                </text>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
