import { format } from "date-fns";
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface TableHeaderProps {
  dates: any;
  workingDays: any;
  tableId: string;
  normalized: Record<string, boolean>;
  sortConfigs: Record<string, { key: string; direction: "asc" | "desc" }>;
  useHistorical: Record<string, boolean>;
  requestSort: (key: string, tableId: string) => void;
  setUseHistorical: (value: React.SetStateAction<Record<string, boolean>>) => void;
}

export function TableHeaderComponent({
  dates,
  workingDays,
  tableId,
  normalized,
  sortConfigs,
  useHistorical,
  requestSort,
  setUseHistorical,
}: TableHeaderProps) {
  const sortConfig = sortConfigs[tableId];

  const renderSortHeader = (key: string, normalizedKey: string, label: string, workingDays: number | null = null, className: string = "") => (
    <TableHead
      onClick={() => requestSort(normalized[tableId] ? normalizedKey : key, tableId)}
      className={`text-right cursor-pointer hover:bg-gray-100 ${className}`}
    >
      {label}
      {workingDays !== null && <span className="block text-[10px] text-gray-500">{workingDays} working days</span>}
      {sortConfig.key === (normalized[tableId] ? normalizedKey : key) && (sortConfig.direction === "asc" ? "↑" : "↓")}
    </TableHead>
  );

  const renderMonthHeader = (date: string, days: number, colSpan: number = 2, className: string = "") => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', date);
      return null;
    }

    return (
      <TableHead colSpan={colSpan} className={`text-center ${className}`}>
        {format(parsedDate, "MMM yyyy")}
        <span className="block text-[10px] text-gray-500">{days} working days</span>
      </TableHead>
    );
  };

  return (
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableHead rowSpan={2} className="w-[50px] text-center">#</TableHead>
        <TableHead rowSpan={2} className="border-r border-gray-400">Client</TableHead>
        {renderMonthHeader(dates.threeMonthsAgo, workingDays.threeMonthsAgo, 2, "border-x border-gray-400")}
        {renderMonthHeader(dates.twoMonthsAgo, workingDays.twoMonthsAgo, 2, "border-x border-gray-400")}
        {renderMonthHeader(dates.oneMonthAgo, workingDays.oneMonthAgo, 2, "border-x border-gray-400")}
        {renderMonthHeader(dates.dateOfInterest, workingDays.inAnalysis, 3, "border-x border-gray-400")}
      </TableRow>
      <TableRow>
        {renderSortHeader("sameDayThreeMonthsAgo", "normalizedSameDayThreeMonthsAgo", `Until ${format(new Date(dates.sameDayThreeMonthsAgo), "dd")}`, workingDays.sameDayThreeMonthsAgo, "w-[95px] border-x border-gray-200")}
        {renderSortHeader("threeMonthsAgo", "normalizedThreeMonthsAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
        {renderSortHeader("sameDayTwoMonthsAgo", "normalizedSameDayTwoMonthsAgo", `Until ${format(new Date(dates.sameDayTwoMonthsAgo), "dd")}`, workingDays.sameDayTwoMonthsAgo, "w-[95px] border-x border-gray-200")}
        {renderSortHeader("twoMonthsAgo", "normalizedTwoMonthsAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
        {renderSortHeader("sameDayOneMonthAgo", "normalizedSameDayOneMonthAgo", `Until ${format(new Date(dates.sameDayOneMonthAgo), "dd")}`, workingDays.sameDayOneMonthAgo, "w-[95px] border-x border-gray-200")}
        {renderSortHeader("oneMonthAgo", "normalizedOneMonthAgo", "Full Month", null, "w-[95px] border-r border-gray-400")}
        {renderSortHeader("realized", "normalizedRealized", "Realized", workingDays.inAnalysisPartial, "w-[120px] border-x border-gray-200")}
        {renderSortHeader("projected", "normalizedProjected", "Projected", null, "w-[120px] border-x border-gray-200")}
        <TableHead className="w-[120px] border-r border-gray-400">
          <div className="flex flex-col items-end">
            <span 
              onClick={() => requestSort(
                normalized[tableId] 
                  ? (useHistorical[tableId] ? "normalizedExpectedHistorical" : "normalizedExpected")
                  : (useHistorical[tableId] ? "expectedHistorical" : "expected"),
                tableId
              )} 
              className="cursor-pointer hover:text-gray-600"
            >
              Expected {sortConfig.key === (useHistorical[tableId] ? "expectedHistorical" : "expected") && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </span>
            <button
              onClick={() => {
                setUseHistorical(prev => ({
                  ...prev,
                  [tableId]: !prev[tableId]
                }));
              }}
              className={`
                text-[10px] mt-0.5 
                ${useHistorical[tableId] 
                  ? 'text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }
                transition-colors cursor-pointer
              `}
            >
              historical
            </button>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 