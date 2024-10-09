"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function Stat({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`mt-2 text-3xl font-semibold ${color ? '' : 'text-gray-900'}`} style={{ color }}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export default function Datasets() {
  const [timesheetKind, setTimesheetKind] = useState("ALL");
  const { loading, error, data } = useQuery(GET_TIMESHEET, {
    variables: { slug: "timesheet-last-six-weeks" },
  });

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Error: {error.message}</p>;

  const { timesheet } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Heading>Datasets</Heading>

      <div className="mt-12">
        <Subheading>Working Hours</Subheading>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title='Total' value={timesheet.totalHours % 1 === 0 ? timesheet.totalHours.toFixed(0) : timesheet.totalHours.toFixed(1)} />
          <Stat title='Consulting' value={timesheet.totalConsultingHours % 1 === 0 ? timesheet.totalConsultingHours.toFixed(0) : timesheet.totalConsultingHours.toFixed(1)} color="#F59E0B" />
          <Stat title='Squad' value={timesheet.totalSquadHours % 1 === 0 ? timesheet.totalSquadHours.toFixed(0) : timesheet.totalSquadHours.toFixed(1)} color="#3B82F6" />
          <Stat title='Internal' value={timesheet.totalInternalHours % 1 === 0 ? timesheet.totalInternalHours.toFixed(0) : timesheet.totalInternalHours.toFixed(1)} color="#10B981" />
        </div>
      </div>

      <div className="mt-16">
        <Subheading>Clients</Subheading>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat title='Unique Clients' value={timesheet.uniqueClients.toString()} />
          <Stat title='Average Hours per Client' value={timesheet.averageHoursPerClient % 1 === 0 ? timesheet.averageHoursPerClient.toFixed(0) : timesheet.averageHoursPerClient.toFixed(1)} />
          <Stat title='Std Dev Hours per Client' value={timesheet.stdDevHoursPerClient % 1 === 0 ? timesheet.stdDevHoursPerClient.toFixed(0) : timesheet.stdDevHoursPerClient.toFixed(1)} />
        </div>
      </div>

      <div className="mt-16">
        <Subheading>Hours by Client</Subheading>
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timesheet.byClient}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickLine={false}
                    axisLine={{ stroke: '#9CA3AF' }}
                  />
                  <YAxis 
                    type="number" 
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#4B5563' }} 
                    tick={{ fontSize: 10, fill: '#6B7280' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#9CA3AF' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      padding: '10px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    formatter={(value, name, props) => {
                      let label;
                      switch(name) {
                        case 'totalConsultingHours':
                          label = 'Consulting';
                          break;
                        case 'totalSquadHours':
                          label = 'Squad';
                          break;
                        case 'totalInternalHours':
                          label = 'Internal';
                          break;
                        default:
                          label = name;
                      }
                      const formattedValue = typeof value === 'number' ? (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) : value;
                      return [<span style={{ color: '#4B5563', fontWeight: 'bold' }}>{`${formattedValue} hours`}</span>, label];
                    }}
                    labelFormatter={(label) => <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1F2937' }}>{label}</span>}
                    separator=": "
                  />
                  <Bar dataKey="totalConsultingHours" name="Consulting" stackId="a" fill="#F59E0B">
                    <animate attributeName="height" from="0" to="100%" dur="1s" />
                  </Bar>
                  <Bar dataKey="totalSquadHours" name="Squad" stackId="a" fill="#3B82F6">
                    <animate attributeName="height" from="0" to="100%" dur="1s" />
                  </Bar>
                  <Bar dataKey="totalInternalHours" name="Internal" stackId="a" fill="#10B981">
                    <animate attributeName="height" from="0" to="100%" dur="1s" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
