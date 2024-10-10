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

interface ByProps {
  title: string;
  data: {
    uniqueItems: number;
    byKind: {
      consulting: { uniqueItems: number };
      squad: { uniqueItems: number };
      internal: { uniqueItems: number };
    };
    byItem: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };
  labels: {
    total: string;
    consulting: string;
    squad: string;
    internal: string;
  };
  className?: string;
}

export function By({ title, data, labels, className }: ByProps) {
  const [selectedStat, setSelectedStat] = useState<string>('total');

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName === selectedStat ? 'total' : statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const getFilteredData = () => {
    let filteredData;
    switch (selectedStat) {
      case 'consulting':
        filteredData = data.byItem.filter(item => item.totalConsultingHours > 0).map(item => ({
          name: item.name,
          hours: item.totalConsultingHours
        }));
        break;
      case 'squad':
        filteredData = data.byItem.filter(item => item.totalSquadHours > 0).map(item => ({
          name: item.name,
          hours: item.totalSquadHours
        }));
        break;
      case 'internal':
        filteredData = data.byItem.filter(item => item.totalInternalHours > 0).map(item => ({
          name: item.name,
          hours: item.totalInternalHours
        }));
        break;
      default:
        return data.byItem.map(item => ({
          name: item.name,
          consultingHours: item.totalConsultingHours,
          squadHours: item.totalSquadHours,
          internalHours: item.totalInternalHours
        }));
    }
    return filteredData.sort((a, b) => b.hours - a.hours);
  };

  const getChartColor = () => {
    switch (selectedStat) {
      case 'consulting':
        return "#F59E0B";
      case 'squad':
        return "#3B82F6";
      case 'internal':
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className={className}>
      <Heading>{title}</Heading>
      <Divider className="my-3" />
      <div className="pl-3 pr-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div
            className={`${getStatClassName('total')} transform`}
            onClick={() => handleStatClick('total')}
          >
            <Stat
              title={labels.total}
              value={data.uniqueItems.toString()}
            />
          </div>
          <div
            className={`${getStatClassName('consulting')} transform`}
            onClick={() => handleStatClick('consulting')}
          >
            <Stat
              title={labels.consulting}
              value={data.byKind.consulting.uniqueItems.toString()}
              color="#F59E0B"
              total={data.uniqueItems}
            />
          </div>
          <div
            className={`${getStatClassName('squad')} transform`}
            onClick={() => handleStatClick('squad')}
          >
            <Stat
              title={labels.squad}
              value={data.byKind.squad.uniqueItems.toString()}
              color="#3B82F6"
              total={data.uniqueItems}
            />
          </div>
          <div
            className={`${getStatClassName('internal')} transform`}
            onClick={() => handleStatClick('internal')}
          >
            <Stat
              title={labels.internal}
              value={data.byKind.internal.uniqueItems.toString()}
              color="#10B981"
              total={data.uniqueItems}
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
              {selectedStat === 'total' ? (
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
                Hours by {title} ({selectedStat === 'total' ? 'Total' : selectedStat})
              </text>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}