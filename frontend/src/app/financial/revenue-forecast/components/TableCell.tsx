import { TableCell as UITableCell } from "@/components/ui/table";
import { formatCurrency, formatPercentage, calculatePercentageChange } from "../utils";

interface TableCellProps {
  value: number;
  normalizedValue: number;
  totalValue: number;
  normalizedTotalValue: number;
  className?: string;
  projected?: number;
  normalizedProjected?: number;
  expected?: number;
  normalizedExpected?: number;
  previousValue?: number | null;
  normalizedPreviousValue?: number | null;
  normalized: boolean;
  highlightYellow?: boolean;
}

export function TableCellComponent({
  value,
  normalizedValue,
  totalValue,
  normalizedTotalValue,
  className = "",
  projected,
  normalizedProjected,
  expected,
  normalizedExpected,
  previousValue = null,
  normalizedPreviousValue = null,
  normalized,
  highlightYellow = false,
}: TableCellProps) {
  const isProjectedLessThanExpected = projected !== undefined && expected !== undefined && projected < expected;
  const bgColor = isProjectedLessThanExpected ? "bg-red-100" : "";
  
  const displayValue = normalized ? normalizedValue : value;
  const displayTotalValue = normalized ? normalizedTotalValue : totalValue;

  let changeInfo = null;
  if (previousValue !== null) {
    changeInfo = calculatePercentageChange(
      normalized ? normalizedValue : value,
      normalized ? normalizedPreviousValue : previousValue,
      normalized
    );
  }

  return (
    <UITableCell
      className={`text-right ${className} ${
        value === 0 ? "text-gray-300" : ""
      } relative ${bgColor} ${highlightYellow ? 'bg-yellow-50' : ''}`}
    >
      {formatCurrency(displayValue)}
      <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1 box-border">
        <span className={changeInfo ? `${changeInfo.indicatorColor}` : ''}>
          {changeInfo && changeInfo.percentageChange !== 0 && (
            <>{changeInfo.indicator} {Math.abs(changeInfo.percentageChange).toFixed(1)}%</>
          )}
        </span>
        <span className="text-gray-400 truncate mr-2">
          {formatPercentage(value, totalValue)}
        </span>
      </div>
    </UITableCell>
  );
} 