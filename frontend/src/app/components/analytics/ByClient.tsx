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

interface ByClientProps {
  timesheet: {
    uniqueClients: number;
    averageHoursPerClient: number;
    stdDevHoursPerClient: number;
    byKind: {
      consulting: {
        uniqueClients: number;
      };
      squad: {
        uniqueClients: number;
      };
      internal: {
        uniqueClients: number;
      };
    };
    byClient: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };
}

export function ByClient({ timesheet, className }: ByClientProps & { className?: string }) {
  return (
    <div className={className}>
      <Heading>By Client</Heading>
      <Divider className="my-3" />
      <div className="pl-3 pr-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-3">
          <Stat
            title="Number of Clients"
            value={timesheet.uniqueClients.toString()}
          />
          <Stat
            title="Number of Consulting Clients"
            value={timesheet.byKind.consulting.uniqueClients.toString()}
            color="#F59E0B"
            total={timesheet.uniqueClients}
          />
          <Stat
            title="Number of Squad Clients"
            value={timesheet.byKind.squad.uniqueClients.toString()}
            color="#3B82F6"
            total={timesheet.uniqueClients}
          />
          <Stat
            title="Number of Internal Clients"
            value={timesheet.byKind.internal.uniqueClients.toString()}
            color="#10B981"
            total={timesheet.uniqueClients}
          />
        </div>

        <div className="h-[400px] border border-gray-200 rounded-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timesheet.byClient}
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
                y="30"
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
  );
}
