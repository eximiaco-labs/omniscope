import {
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { format } from "date-fns";

interface TableHeaderFutureProps {
  dates: any;
  workingDays: any;
  tableId: string;
  normalized: Record<string, boolean>;
  sortConfigs: Record<string, { key: string; direction: "asc" | "desc" }>;
  requestSort: (key: string, tableId: string) => void;
}

export function TableHeaderFuture({
  dates,
  workingDays,
  tableId,
  normalized,
  sortConfigs,
  requestSort,
}: TableHeaderFutureProps) {
  const sortConfig = sortConfigs[tableId];

  const renderSortHeader = (key: string, normalizedKey: string, label: string, workingDays: number | null = null, className: string = "") => {
    const currentKey = normalized[tableId] ? normalizedKey : key;
    const isSorted = sortConfig?.key === currentKey;
    const sortDirection = isSorted ? sortConfig.direction : null;

    return (
      <TableHead
        onClick={() => requestSort(currentKey, tableId)}
        className={`text-right cursor-pointer hover:bg-gray-100 ${className}`}
      >
        {label}
        {workingDays !== null && (
          <span className="block text-[10px] text-gray-500">
            {workingDays} working days
          </span>
        )}
        {isSorted && (sortDirection === "asc" ? "↑" : "↓")}
      </TableHead>
    );
  };

  const renderMonthHeader = (date: string, days: number, colSpan: number = 1, className: string = "") => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return <TableHead colSpan={colSpan} className={`text-center ${className}`}>Invalid Date</TableHead>;
      }

      return (
        <TableHead colSpan={colSpan} className={`text-center ${className}`}>
          {format(parsedDate, "MMM yyyy")}
          <span className="block text-[10px] text-gray-500">{days} working days</span>
        </TableHead>
      );
    } catch (error) {
      console.error('Error parsing date:', error);
      return <TableHead colSpan={colSpan} className={`text-center ${className}`}>Invalid Date</TableHead>;
    }
  };

  return (
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableHead rowSpan={2} className="w-[50px] text-center">#</TableHead>
        <TableHead rowSpan={2} className="border-r border-gray-400">Client</TableHead>
        {renderMonthHeader(dates.inAnalysis, workingDays.inAnalysis, 3, "border-x border-gray-400")}
        {renderMonthHeader(dates.lastDayOfOneMonthLater, workingDays.oneMonthLater, 1, "border-x border-gray-400")}
        {renderMonthHeader(dates.lastDayOfTwoMonthsLater, workingDays.twoMonthsLater, 1, "border-x border-gray-400")}
        {renderMonthHeader(dates.lastDayOfThreeMonthsLater, workingDays.threeMonthsLater, 1, "border-r border-gray-400")}
      </TableRow>
      <TableRow>
        {renderSortHeader("realized", "normalizedRealized", "Realized", workingDays.inAnalysisPartial, "w-[120px] border-x border-gray-200")}
        {renderSortHeader("projected", "normalizedProjected", "Projected", null, "w-[120px] border-x border-gray-200")}
        {renderSortHeader("expected", "normalizedExpected", "Expected", null, "w-[120px] border-r border-gray-400")}
        {renderSortHeader("expectedOneMonthLater", "normalizedExpectedOneMonthLater", "Expected", null, "w-[120px] border-x border-gray-200")}
        {renderSortHeader("expectedTwoMonthsLater", "normalizedExpectedTwoMonthsLater", "Expected", null, "w-[120px] border-x border-gray-200")}
        {renderSortHeader("expectedThreeMonthsLater", "normalizedExpectedThreeMonthsLater", "Expected", null, "w-[120px] border-r border-gray-400")}
      </TableRow>
    </TableHeader>
  );
} 