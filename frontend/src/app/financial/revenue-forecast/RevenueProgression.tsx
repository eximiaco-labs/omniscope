import { format } from "date-fns";
import SectionHeader from "@/components/SectionHeader";

interface RevenueProgressionProps {
  data: {
    forecast: {
      dates: {
        threeMonthsAgo: string;
        twoMonthsAgo: string;
        oneMonthAgo: string;
      };
      summary: {
        threeMonthsAgo: number;
        twoMonthsAgo: number;
        oneMonthAgo: number;
        realized: number;
        projected: number;
        expected: number;
      };
    };
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const RevenueProgression = ({ data }: RevenueProgressionProps) => {
  return (
    <div className="mb-8 border-b pb-8">
      <SectionHeader title="Revenue Progression" subtitle=" " />
      <div className="mx-2">
        <div className="grid grid-cols-5 gap-6">
          {/* Three Months Ago */}
          <div className="text-left p-4">
            <SectionHeader
              title={format(new Date(data.forecast.dates.threeMonthsAgo), "MMM yyyy")}
              subtitle=" "
            />
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(data.forecast.summary.threeMonthsAgo)}
            </div>
          </div>

          {/* Two Months Ago */}
          <div className="text-left p-4">
            <SectionHeader
              title={format(new Date(data.forecast.dates.twoMonthsAgo), "MMM yyyy")}
              subtitle=" "
            />
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(data.forecast.summary.twoMonthsAgo)}
            </div>
            <div
              className={`text-xs flex items-center gap-1 mt-2 font-medium ${
                data.forecast.summary.twoMonthsAgo > data.forecast.summary.threeMonthsAgo
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {data.forecast.summary.twoMonthsAgo > data.forecast.summary.threeMonthsAgo ? "▲" : "▼"}
              {Math.abs(
                (data.forecast.summary.twoMonthsAgo / data.forecast.summary.threeMonthsAgo - 1) * 100
              ).toFixed(1)}
              % vs {format(new Date(data.forecast.dates.threeMonthsAgo), "MMM")}
            </div>
          </div>

          {/* One Month Ago */}
          <div className="text-left p-4">
            <SectionHeader
              title={format(new Date(data.forecast.dates.oneMonthAgo), "MMM yyyy")}
              subtitle=" "
            />
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(data.forecast.summary.oneMonthAgo)}
            </div>
            <div
              className={`text-xs flex items-center gap-1 mt-2 font-medium ${
                data.forecast.summary.oneMonthAgo > data.forecast.summary.twoMonthsAgo
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {data.forecast.summary.oneMonthAgo > data.forecast.summary.twoMonthsAgo ? "▲" : "▼"}
              {Math.abs(
                (data.forecast.summary.oneMonthAgo / data.forecast.summary.twoMonthsAgo - 1) * 100
              ).toFixed(1)}
              % vs {format(new Date(data.forecast.dates.twoMonthsAgo), "MMM")}
            </div>
          </div>

          {/* Current */}
          <div className="col-span-2 border-l-4 border-blue-300 pl-8 p-4">
            <SectionHeader title="Current" subtitle=" " />
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-12">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(data.forecast.summary.realized)}
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 mt-2 font-medium ${
                      data.forecast.summary.realized > data.forecast.summary.oneMonthAgo
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {data.forecast.summary.realized > data.forecast.summary.oneMonthAgo ? "▲" : "▼"}
                    {Math.abs(
                      (data.forecast.summary.realized / data.forecast.summary.oneMonthAgo - 1) * 100
                    ).toFixed(1)}
                    % vs {format(new Date(data.forecast.dates.oneMonthAgo), "MMM")}
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col">
                    <div className="text-xs font-medium text-gray-500">Projected</div>
                    <div className="text-lg font-bold text-gray-700">
                      {formatCurrency(data.forecast.summary.projected)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xs font-medium text-gray-500">Expected</div>
                    <div className="text-lg font-bold text-gray-700">
                      {formatCurrency(data.forecast.summary.expected)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 