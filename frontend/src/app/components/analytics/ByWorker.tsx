import { Stat } from "@/app/components/analytics/stat";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

interface ByWorkerProps {
  timesheet: {
    uniqueWorkers: number;
    byKind: {
      consulting: {
        uniqueWorkers: number;
      };
      squad: {
        uniqueWorkers: number;
      };
      internal: {
        uniqueWorkers: number;
      };
    };
    byWorker: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };
}

export function ByWorker({ timesheet, className }: ByWorkerProps & { className?: string }) {
  const [selectedStat, setSelectedStat] = useState<string>('totalWorkers');

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName === selectedStat ? 'totalWorkers' : statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const getFilteredData = () => {
    let data;
    switch (selectedStat) {
      case 'consultingWorkers':
        data = timesheet.byWorker.filter(worker => worker.totalConsultingHours > 0).map(worker => ({
          name: worker.name,
          hours: worker.totalConsultingHours
        }));
        break;
      case 'squadWorkers':
        data = timesheet.byWorker.filter(worker => worker.totalSquadHours > 0).map(worker => ({
          name: worker.name,
          hours: worker.totalSquadHours
        }));
        break;
      case 'internalWorkers':
        data = timesheet.byWorker.filter(worker => worker.totalInternalHours > 0).map(worker => ({
          name: worker.name,
          hours: worker.totalInternalHours
        }));
        break;
      default:
        return timesheet.byWorker.map(worker => ({
          name: worker.name,
          consultingHours: worker.totalConsultingHours,
          squadHours: worker.totalSquadHours,
          internalHours: worker.totalInternalHours
        }));
    }
    return data.sort((a, b) => b.hours - a.hours);
  };

  const getChartColor = () => {
    switch (selectedStat) {
      case 'consultingWorkers':
        return "#F59E0B";
      case 'squadWorkers':
        return "#3B82F6";
      case 'internalWorkers':
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className={className}>
      <Heading>By Worker</Heading>
      <Divider className="my-3" />
      <div className="pl-3 pr-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div
            className={`${getStatClassName('totalWorkers')} transform`}
            onClick={() => handleStatClick('totalWorkers')}
          >
            <Stat
              title="Number of Workers"
              value={timesheet.uniqueWorkers.toString()}
            />
          </div>
          <div
            className={`${getStatClassName('consultingWorkers')} transform`}
            onClick={() => handleStatClick('consultingWorkers')}
          >
            <Stat
              title="Consultants"
              value={timesheet.byKind.consulting.uniqueWorkers.toString()}
              color="#F59E0B"
              total={timesheet.uniqueWorkers}
            />
          </div>
          <div
            className={`${getStatClassName('squadWorkers')} transform`}
            onClick={() => handleStatClick('squadWorkers')}
          >
            <Stat
              title="Engineers"
              value={timesheet.byKind.squad.uniqueWorkers.toString()}
              color="#3B82F6"
              total={timesheet.uniqueWorkers}
            />
          </div>
          <div
            className={`${getStatClassName('internalWorkers')} transform`}
            onClick={() => handleStatClick('internalWorkers')}
          >
            <Stat
              title="Internal"
              value={timesheet.byKind.internal.uniqueWorkers.toString()}
              color="#10B981"
              total={timesheet.uniqueWorkers}
            />
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getFilteredData()}
              layout="horizontal"
              margin={{ top: 80, right: 20, left: 20, bottom: 10 }}
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
                    name,
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
              {selectedStat === 'totalWorkers' ? (
                <>
                  <Bar dataKey="consultingHours" stackId="a" fill="#F59E0B" name="Consulting">
                    <animate attributeName="height" from="0" to="100%" dur="1s" />
                  </Bar>
                  <Bar dataKey="squadHours" stackId="a" fill="#3B82F6" name="Squad">
                    <animate attributeName="height" from="0" to="100%" dur="1s" />
                  </Bar>
                  <Bar dataKey="internalHours" stackId="a" fill="#10B981" name="Internal">
                    <animate attributeName="height" from="0" to="100%" dur="1s" />
                  </Bar>
                </>
              ) : (
                <Bar
                  dataKey="hours"
                  fill={getChartColor()}
                >
                  <animate attributeName="height" from="0" to="100%" dur="1s" />
                </Bar>
              )}
              <text
                x="50%"
                y="30"
                textAnchor="middle"
                fill="#374151"
                fontSize="18"
                fontWeight="bold"
              >
                Hours by Worker ({selectedStat === 'totalWorkers' ? 'Total' : selectedStat.replace('Workers', '')})
              </text>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}