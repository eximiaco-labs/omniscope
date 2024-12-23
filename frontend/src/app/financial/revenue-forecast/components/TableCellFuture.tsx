import { TableCell } from "@/components/ui/table";
import { formatCurrency } from "../utils";

interface TableCellFutureProps {
  value: number;
  normalizedValue: number;
  totalValue: number;
  normalizedTotalValue: number;
  className?: string;
  normalized: boolean;
  projected?: number;
  normalizedProjected?: number;
  expected?: number;
  normalizedExpected?: number;
}

export function TableCellFuture({
  value,
  normalizedValue,
  totalValue,
  normalizedTotalValue,
  className = "",
  normalized,
  projected,
  normalizedProjected,
  expected,
  normalizedExpected,
}: TableCellFutureProps) {
  const displayValue = normalized ? normalizedValue : value;
  const displayTotal = normalized ? normalizedTotalValue : totalValue;
  const displayProjected = normalized ? normalizedProjected : projected;
  const displayExpected = normalized ? normalizedExpected : expected;
  
  const percentage = displayTotal ? (displayValue / displayTotal) * 100 : 0;

  const getComparisonStyle = () => {
    if (!displayProjected || !displayExpected) return "";
    return displayProjected < displayExpected ? "bg-red-100" : "";
  };

  return (
    <TableCell className={`text-right ${className} ${getComparisonStyle()}`}>
      <div>
        <span className={displayValue === 0 ? "text-gray-300" : ""}>
          {formatCurrency(displayValue)}
        </span>
        {displayValue !== 0 && (
          <div className="text-[10px] text-gray-500">
            {percentage.toFixed(1)}%
          </div>
        )}
      </div>
    </TableCell>
  );
} 