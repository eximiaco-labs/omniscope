import { motion } from "framer-motion";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const GaugeComponent = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});

type ComparisonData = {
  hoursPrevious: number;
  hoursCurrent: number;
  hoursPreviousUntilThisDate: number;
};

type ComparisonPanelProps = {
  type: 'month' | 'week';
  data: ComparisonData;
};

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ type, data }) => {
  const isMonth = type === 'month';
  const prefix = isMonth ? 'month' : 'week';
  const capitalizedPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);

  const { hoursPrevious, hoursCurrent, hoursPreviousUntilThisDate } = data;
  const targetHours = Math.max(hoursPrevious * 1.1, hoursCurrent);

  const gaugeSubArcs = hoursPrevious === hoursPreviousUntilThisDate
    ? [
        {
          limit: hoursPrevious,
          color: "#B77A00",
        },
        {
          limit: targetHours,
          color: "#228B22",
        },
      ]
    : [
        {
          limit: hoursPreviousUntilThisDate,
          color: "#B22222",
        },
        {
          limit: hoursPrevious,
          color: "#B77A00",
        },
        {
          limit: targetHours,
          color: "#228B22",
        },
      ];

  return (
    <motion.div
      className="col-span-2 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: isMonth ? 0.7 : 0.8 }}
    >
      {/* Header */}
      <motion.div
        className="p-2 border-b border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm font-bold">{capitalizedPrefix}ly Hours Comparison</div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="p-4 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-full h-[150px]">
          <GaugeComponent
            id={`${prefix}-hours-gauge`}
            value={hoursCurrent}
            maxValue={targetHours}
            type="radial"
            marginInPercent={{
              top: 0,
              left: 0.3,
              bottom: 0,
              right: 0.3,
            }}
            arc={{
              padding: 0.02,
              width: 0.3,
              subArcs: gaugeSubArcs,
            }}
            pointer={{
              type: "arrow",
              color: "#345243",
              length: 0.8,
              width: 15,
            }}
            labels={{
              valueLabel: { hide: true },
              tickLabels: { hideMinMax: true },
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-black">
              {hoursCurrent.toFixed(1)}h
            </span>
            <span
              className={`text-xs ${
                hoursCurrent > hoursPreviousUntilThisDate
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {hoursCurrent > hoursPreviousUntilThisDate ? "▲" : "▼"}
              {Math.abs(
                ((hoursCurrent - hoursPreviousUntilThisDate) /
                  (hoursPreviousUntilThisDate || 1)) *
                  100
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="flex justify-between text-xs px-4 py-2 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {hoursPrevious !== hoursPreviousUntilThisDate && (
          <div style={{ color: "#B22222" }}>
            <span>Previous {capitalizedPrefix === "Week" ? "Weeks" : capitalizedPrefix}</span>
            <br />
            <span className="font-bold">
              {hoursPreviousUntilThisDate.toFixed(1)}h
            </span>
          </div>
        )}
        <div style={{ color: "#B77A00" }} className={hoursPrevious === hoursPreviousUntilThisDate ? "" : "text-right"}>
          <span>Previous {capitalizedPrefix === "Week" ? "Weeks" : capitalizedPrefix} (Total)</span>
          <br />
          <span className="font-bold">{hoursPrevious.toFixed(1)}h</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const MonthComparisonPanel: React.FC<{ data: any }> = ({ data }) => (
  <ComparisonPanel
    type="month"
    data={{
      hoursPrevious: data?.weekReview?.monthSummary?.hoursPreviousMonth || 10,
      hoursCurrent: data?.weekReview?.monthSummary?.hoursThisMonth || 5,
      hoursPreviousUntilThisDate: data?.weekReview?.monthSummary?.hoursPreviousMonthUntilThisDate || 0,
    }}
  />
);

export const WeekComparisonPanel: React.FC<{ data: any }> = ({ data }) => (
  <ComparisonPanel
    type="week"
    data={{
      hoursPrevious: data?.weekReview?.hoursPreviousWeeks || 10,
      hoursCurrent: data?.weekReview?.hoursThisWeek || 5,
      hoursPreviousUntilThisDate: data?.weekReview?.hoursPreviousWeeksUntilThisDate || 0,
    }}
  />
);
