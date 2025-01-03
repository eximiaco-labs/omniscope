import React, { useState } from "react";
import { gql, useQuery, ApolloError } from "@apollo/client";
import { STAT_COLORS } from "../constants/colors";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SectionHeader from "@/components/SectionHeader";
import { Stat } from "@/app/components/analytics/stat";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ContributionProps {
  month?: number;
  year?: number;
  workerName?: string;
  clientName?: string;
  sponsor?: string;
  caseTitle?: string;
}

interface WeekInfo {
  key: string;
  label: string;
  date: Date;
  weekNumber: number;
}

interface DayCell {
  key: string;
  label: string;
  hours: number;
  fullDate: string;
}

interface DayRow {
  dayName: string;
  cells: DayCell[];
}

interface MonthGroup {
  month: string;
  startIndex: number;
  count: number;
}

interface DayHours {
  [key: string]: {
    // date as string
    consulting: number;
    handsOn: number;
    squad: number;
    internal: number;
  };
}

const ALLOCATION_QUERY = gql`
  query AllocationOfYear(
    $startDate: Date!
    $endDate: Date!
    $filters: [FilterInput!]
  ) {
    allocation(startDate: $startDate, endDate: $endDate, filters: $filters) {
      byKind {
        consulting {
          date
          hours
        }
        handsOn {
          date
          hours
        }
        squad {
          date
          hours
        }
        internal {
          date
          hours
        }
      }
    }
  }
`;

const DAILY_APPOINTMENTS_QUERY = gql`
  query DailyAppointments($slug: String!, $filters: [FilterInput!]) {
    timesheet(slug: $slug, filters: $filters) {
      appointments {
        clientName
        clientSlug
        workerName
        workerSlug
        comment
        timeInHs
      }
    }
  }
`;

const OneYearAllocation: React.FC<ContributionProps> = ({
  month,
  year,
  workerName,
  clientName,
  sponsor,
  caseTitle,
}) => {
  type KindType = 'consulting' | 'handsOn' | 'squad' | 'internal';

  const getKindColor = (kind: KindType) => {
    switch (kind) {
      case 'consulting':
        return "#F59E0B";
      case 'handsOn':
        return "#8B5CF6";
      case 'squad':
        return "#3B82F6";
      case 'internal':
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  // Initialize with empty string to ensure we select first non-zero value
  const [selectedKind, setSelectedKind] = useState<KindType | ''>('');
  const [selectedBinIndex, setSelectedBinIndex] = useState<number | null>(null);
  const currentDate = new Date();
  const specifiedMonth = month || currentDate.getMonth() + 1;
  const specifiedYear = year || currentDate.getFullYear();
  const tolerance = 0.1; // 6 minutes tolerance

  // Calculate end date (last day of specified month/year)
  const endDate = new Date(specifiedYear, specifiedMonth, 0);

  // Calculate start date (first day, 11 months before specified month/year)
  const startDate = new Date(specifiedYear, specifiedMonth - 12, 1);

  // Create filters combining workerName and clientName if provided
  const filters = [
    ...(workerName
      ? [
          {
            field: "WorkerName",
            selectedValues: [workerName],
          },
        ]
      : []),
    ...(clientName
      ? [
          {
            field: "ClientName",
            selectedValues: [clientName],
          },
        ]
      : []),
    ...(sponsor
      ? [
          {
            field: "Sponsor",
            selectedValues: [sponsor],
          },
        ]
      : []),
    ...(caseTitle
      ? [
          {
            field: "CaseTitle",
            selectedValues: [caseTitle],
          },
        ]
      : []),
  ];

  const { loading, error, data } = useQuery(ALLOCATION_QUERY, {
    variables: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      filters: filters.length > 0 ? filters : null,
    },
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Add query for appointments
  const { data: appointmentsData, loading: appointmentsLoading } = useQuery(
    DAILY_APPOINTMENTS_QUERY,
    {
      variables: {
        slug: selectedDate 
          ? `timesheet-${
              // Format date from YYYY-MM-DD to DD-MM-YYYY-DD-MM-YYYY
              selectedDate.split('-').reverse().join('-')}-${
              selectedDate.split('-').reverse().join('-')
            }`
          : "",
        filters: filters.length > 0 ? filters : null,
      },
      skip: !selectedDate,
    }
  );

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as ApolloError).message}</div>;

  // Calculate total hours for each kind
  const totals = {
    consulting: 0,
    handsOn: 0,
    squad: 0,
    internal: 0,
  };

  if (data?.allocation?.byKind) {
    Object.entries(data.allocation.byKind).forEach(([kind, entries]) => {
      if (Array.isArray(entries) && kind in totals) {
        totals[kind as keyof typeof totals] = entries.reduce(
          (sum, entry) => sum + entry.hours,
          0
        );
      }
    });
  }

  // Set initial selected kind to first non-zero value if not already set
  if (selectedKind === '') {
    const firstNonZeroKind = Object.entries(totals).find(
      ([_, value]) => value > 0
    )?.[0] as KindType;
    if (firstNonZeroKind) {
      setSelectedKind(firstNonZeroKind);
    } else {
      setSelectedKind('consulting');
    }
  }

  // Process hours data into a map for easy lookup
  const hoursMap: DayHours = {};
  if (data?.allocation?.byKind) {
    Object.entries(data.allocation.byKind).forEach(([kind, entries]) => {
      if (Array.isArray(entries)) {
        entries.forEach((entry) => {
          const date = entry.date;
          if (!hoursMap[date]) {
            hoursMap[date] = {
              consulting: 0,
              handsOn: 0,
              squad: 0,
              internal: 0,
            };
          }
          hoursMap[date][kind as keyof typeof totals] = entry.hours;
        });
      }
    });
  }

  // Helper function to get ISO week number
  const getWeekNumber = (date: Date) => {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    return {
      month: date.toLocaleString("en", { month: "short" }),
      week: getWeekNumber(date),
      day: date.getDate(),
      dayOfWeek: date.getDay(),
      monthNum: date.getMonth(),
      year: date.getFullYear(),
    };
  };

  // Generate weeks array
  const generateWeeks = () => {
    const weeks = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Get the dates for all days in this week
      const weekDates = [];
      const weekStart = new Date(currentDate);

      // Ensure we're starting from Sunday
      const daysSinceLastSunday = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - daysSinceLastSunday);

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
      }

      // Determine which month this week belongs to using Friday (index 5)
      const weekFriday = weekDates[5]; // Friday is the determining day
      const formatted = formatDate(weekFriday);

      weeks.push({
        key: currentDate.toISOString(),
        label: formatted.month,
        date: new Date(currentDate),
        weekNumber: formatted.week,
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return weeks;
  };

  // Group weeks by month
  const groupWeeksByMonth = (weeks: WeekInfo[]): MonthGroup[] => {
    const groups: MonthGroup[] = [];
    let currentGroup = { month: "", startIndex: 0, count: 0 };

    weeks.forEach((week, index) => {
      if (currentGroup.month === "") {
        currentGroup = { month: week.label, startIndex: index, count: 1 };
      } else if (currentGroup.month === week.label) {
        currentGroup.count++;
      } else {
        groups.push({ ...currentGroup });
        currentGroup = { month: week.label, startIndex: index, count: 1 };
      }
    });

    if (currentGroup.count > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  // Helper function to format tooltip content
  const formatTooltip = (date: string, label: string, hours: number) => {
    if (!label) return "";
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleString("en", {
      month: "short",
      day: "2-digit",
    });
    return `${formattedDate} - ${
      hours > 0 ? `${hours.toFixed(1)}h` : "No hours"
    }`;
  };

  // Helper function to get darker color for border
  const getDarkerColor = (color: string, opacity: number) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const darken = 0.6 - opacity * 0.2; // More contrast for borders
    return `rgba(${Math.floor(r * darken)}, ${Math.floor(
      g * darken
    )}, ${Math.floor(b * darken)}, ${opacity + 0.3})`;
  };

  // Helper function to get bin index for hours
  const getBinIndex = (hours: number, histogramData: any[]) => {
    if (hours === 0 || histogramData.length === 0) return -1;
    return histogramData.findIndex(
      (bin) => hours >= bin.min && hours <= bin.max
    );
  };

  // Modify generateDayRows to include full date for tooltip
  const generateDayRows = (weeks: WeekInfo[]): DayRow[] => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (dayName, dayIndex) => {
        const dayCells = weeks.map((week) => {
          const dayDate = new Date(week.date);
          const diff = dayIndex - dayDate.getDay();
          dayDate.setDate(dayDate.getDate() + diff);

          if (dayDate >= startDate && dayDate <= endDate) {
            const formatted = formatDate(dayDate);
            const dateStr = dayDate.toISOString().split("T")[0];
            const hours =
              hoursMap[dateStr]?.[selectedKind as keyof typeof totals] || 0;

            return {
              key: dayDate.toISOString(),
              label: `${formatted.month} ${formatted.day
                .toString()
                .padStart(2, "0")}`,
              hours,
              fullDate: dateStr,
            };
          }
          return {
            key: `empty-${week.key}-${dayIndex}`,
            label: "",
            hours: 0,
            fullDate: "",
          };
        });

        return {
          dayName,
          cells: dayCells,
        };
      }
    );
  };

  // Helper function to get color with opacity
  const getColorWithOpacity = (color: string, opacity: number) => {
    // Convert hex to RGB and apply opacity with increased contrast
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Increase contrast by adjusting the RGB values based on opacity
    const contrastFactor = 0.7 + opacity * 0.3; // Will be between 0.7 and 1.0
    const adjustedR = Math.round(r * contrastFactor);
    const adjustedG = Math.round(g * contrastFactor);
    const adjustedB = Math.round(b * contrastFactor);

    return `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${opacity})`;
  };

  // Helper function to check if hours fall within selected bin
  const isInSelectedBin = (hours: number, histogramData: any[]) => {
    if (selectedBinIndex === null) return true;
    if (hours === 0) return false;
    const bin = histogramData[selectedBinIndex];
    if (!bin) return false;

    // For discrete values (when we have few unique values)
    if (bin.isDiscrete) {
      return Math.abs(hours - bin.value) <= tolerance;
    }

    // For continuous ranges
    return (
      hours >= bin.min &&
      // Include the max value in the last bin
      (selectedBinIndex === histogramData.length - 1
        ? hours <= bin.max
        : hours < bin.max)
    );
  };

  // Calculate histogram data
  const calculateHistogram = () => {
    const tolerance = 0.1; // 6 minutes tolerance

    // Get all non-zero hours for the selected kind
    const allHours = Object.values(hoursMap)
      .map((day) => day[selectedKind as keyof typeof totals])
      .filter((hours) => hours > 0);

    if (allHours.length === 0) return [];

    // Sort hours to analyze distribution
    const sortedHours = [...allHours].sort((a, b) => a - b);

    // Find unique values with a small tolerance to group very close values
    const uniqueValues = sortedHours.reduce((acc, curr) => {
      if (
        acc.length === 0 ||
        Math.abs(curr - acc[acc.length - 1]) > tolerance
      ) {
        acc.push(curr);
      }
      return acc;
    }, [] as number[]);

    // If we have very few unique values, use them directly as bin boundaries
    if (uniqueValues.length <= 5) {
      const bins = uniqueValues.map((value, i) => ({
        min: value - tolerance / 2,
        max: value + tolerance / 2,
        value: value, // Store the exact value for discrete bins
        isDiscrete: true,
        count: sortedHours.filter((h) => Math.abs(h - value) <= tolerance)
          .length,
        opacity: 0.3 + i * (0.6 / Math.max(1, uniqueValues.length - 1)),
      }));
      return bins;
    }

    // For more distributed values, create adaptive bins
    const minHours = sortedHours[0];
    const maxHours = sortedHours[sortedHours.length - 1];

    // Start with a target of 5 bins
    let targetBins = 5;
    let binSize = (maxHours - minHours) / targetBins;

    // Create initial bins
    const bins: {
      min: number;
      max: number;
      count: number;
      opacity: number;
      isDiscrete: boolean;
    }[] = [];
    let currentMin = minHours;

    while (currentMin < maxHours) {
      const currentMax = Math.min(maxHours, currentMin + binSize);
      const count = sortedHours.filter(
        (h) =>
          h >= currentMin &&
          // Include the max value in the last bin
          (bins.length === targetBins - 1 ? h <= currentMax : h < currentMax)
      ).length;

      // Only add bin if it has values
      if (count > 0) {
        bins.push({
          min: currentMin,
          max: currentMax,
          isDiscrete: false,
          count,
          opacity: 0.3 + bins.length * (0.6 / Math.min(4, targetBins - 1)),
        });
      }

      currentMin = currentMax;
    }

    return bins;
  };

  const weeks = generateWeeks();
  const monthGroups = groupWeeksByMonth(weeks);
  const dayRows = generateDayRows(weeks);
  const histogramData = calculateHistogram();

  const renderKinds = () => {
    if (!data) return null;

    const totalHours = totals.consulting + totals.handsOn + totals.squad + totals.internal;

    const getStatClassName = (kind: KindType) => {
      return `transform cursor-pointer transition-all duration-300 ${
        selectedKind === kind ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
      } ${totals[kind] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`;
    };

    const handleKindClick = (kind: KindType) => {
      if (totals[kind] > 0) {
        setSelectedKind(selectedKind === kind ? '' : kind);
        setSelectedBinIndex(null);
      }
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className={getStatClassName("consulting")}
            onClick={() => handleKindClick("consulting")}
          >
            <Stat
              title="Consulting"
              value={totals.consulting.toString()}
              color={getKindColor("consulting")}
              total={totalHours}
              formatter={(value: number) => `${value.toFixed(1)}h`}
            />
          </div>
          <div
            className={getStatClassName("handsOn")}
            onClick={() => handleKindClick("handsOn")}
          >
            <Stat
              title="Hands On"
              value={totals.handsOn.toString()}
              color={getKindColor("handsOn")}
              total={totalHours}
              formatter={(value: number) => `${value.toFixed(1)}h`}
            />
          </div>
          <div
            className={getStatClassName("squad")}
            onClick={() => handleKindClick("squad")}
          >
            <Stat
              title="Squad"
              value={totals.squad.toString()}
              color={getKindColor("squad")}
              total={totalHours}
              formatter={(value: number) => `${value.toFixed(1)}h`}
            />
          </div>
          <div
            className={getStatClassName("internal")}
            onClick={() => handleKindClick("internal")}
          >
            <Stat
              title="Internal"
              value={totals.internal.toString()}
              color={getKindColor("internal")}
              total={totalHours}
              formatter={(value: number) => `${value.toFixed(1)}h`}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderHistogram = () => {
    if (!data || histogramData.length === 0) return null;

    const totalOccurrences = histogramData.reduce((sum, bin) => sum + bin.count, 0);

    return (
      <div className="mt-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {histogramData.map((bin, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg cursor-pointer transition-all hover:ring-1 hover:ring-gray-300 relative
                ${selectedBinIndex === index ? "ring-2 ring-blue-500 hover:ring-2 hover:ring-blue-500" : ""}`}
              style={{
                backgroundColor: getColorWithOpacity(
                  getKindColor(selectedKind as KindType),
                  selectedKind ? bin.opacity : 0.3
                ),
              }}
              onClick={() =>
                setSelectedBinIndex(selectedBinIndex === index ? null : index)
              }
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-600">
                  {bin.min.toFixed(1)}h - {bin.max.toFixed(1)}h
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-lg font-semibold">{bin.count}</span>
                  <span className="text-xs text-gray-500">occurrences</span>
                </div>
              </div>
              <div className="absolute bottom-1 right-2 text-xs opacity-90">
                {((bin.count / totalOccurrences) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentsSheet = () => {
    if (!selectedDate) return null;

    const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <Sheet open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{formattedDate}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : appointmentsData?.timesheet?.appointments?.length ? (
              <div className="space-y-4">
                {appointmentsData.timesheet.appointments.map((appointment: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <a 
                          href={`/about-us/clients/${appointment.clientSlug}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {appointment.clientName}
                        </a>
                        <a 
                          href={`/about-us/consultants-and-engineers/${appointment.workerSlug}`}
                          className="block text-sm text-gray-500 hover:underline"
                        >
                          {appointment.workerName}
                        </a>
                      </div>
                      <span className="text-sm font-medium">
                        {appointment.timeInHs.toFixed(1)}h
                      </span>
                    </div>
                    {appointment.comment && (
                      <p className="mt-2 text-sm text-gray-600">
                        {appointment.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <span className="text-sm text-gray-500">No appointments found</span>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  const renderAllocationGrid = () => {
    if (!data) return null;

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-xs text-gray-400"></th>
              {monthGroups.map((group) => (
                <th
                  key={`${group.month}-${group.startIndex}`}
                  className="text-xs text-gray-600 text-left font-normal"
                  colSpan={group.count}
                >
                  {group.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayRows.map((row) => (
              <tr key={row.dayName}>
                <td className="text-xs text-gray-600 font-normal">
                  {row.dayName}
                </td>
                {row.cells.map((cell) => (
                  <TooltipProvider key={cell.key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td className="text-xs hover:bg-gray-50">
                          <div className="flex items-center justify-center">
                            {cell.label && (
                              <div
                                className="w-2.5 h-2.5 rounded-[1px] transition-opacity duration-200 cursor-pointer"
                                style={{
                                  backgroundColor:
                                    cell.hours > 0
                                      ? getColorWithOpacity(
                                          getKindColor(selectedKind as KindType),
                                          histogramData[
                                            getBinIndex(
                                              cell.hours,
                                              histogramData
                                            )
                                          ]?.opacity || 0
                                        )
                                      : "rgba(200, 200, 200, 0.1)",
                                  border: `1px solid ${
                                    cell.hours > 0
                                      ? getDarkerColor(
                                          getKindColor(selectedKind as KindType),
                                          histogramData[
                                            getBinIndex(
                                              cell.hours,
                                              histogramData
                                            )
                                          ]?.opacity || 0
                                        )
                                      : "rgba(150, 150, 150, 0.2)"
                                  }`,
                                  opacity: isInSelectedBin(
                                    cell.hours,
                                    histogramData
                                  )
                                    ? 1
                                    : 0.1,
                                }}
                                onClick={() => cell.fullDate && handleDateClick(cell.fullDate)}
                              />
                            )}
                          </div>
                        </td>
                      </TooltipTrigger>
                      {cell.label && (
                        <TooltipContent>
                          <p>
                            {formatTooltip(
                              cell.fullDate,
                              cell.label,
                              cell.hours
                            )}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as ApolloError).message}</div>;

  return (
    <div className="mb-8">
      <SectionHeader
        title="One Year Allocation"
        subtitle={`${startDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })} TO ${endDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}`}
      />
      <div className="ml-2 mr-2">
        {renderKinds()}
        {renderHistogram()}
        {renderAllocationGrid()}
        {renderAppointmentsSheet()}
      </div>
    </div>
  );
};

export default OneYearAllocation;
