import React from "react";
import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { TableCellComponent } from "./TableCell";

const isSignificantlyHigher = (monthValue: number, sameDayValue: number): boolean => {
  if (!monthValue || !sameDayValue) return false;
  return (monthValue - sameDayValue) / sameDayValue > 0.1; // 10% higher
};

interface TableRowProps {
  item: any;
  depth?: number;
  total: any;
  tableId: string;
  normalized: Record<string, boolean>;
  useHistorical: Record<string, boolean>;
  expandedClients: Record<string, string[]>;
  toggleClient: (clientSlug: string, tableId: string) => void;
  index?: number | null;
}

export function TableRowComponent({
  item,
  depth = 0,
  total,
  tableId,
  normalized,
  useHistorical,
  expandedClients,
  toggleClient,
  index,
}: TableRowProps) {
  const baseClasses = depth === 1 ? "bg-gray-50" : depth === 2 ? "bg-gray-100" : depth === 3 ? "bg-gray-150" : "";
  const paddingLeft = depth * 4;
  const expectedValue = useHistorical[tableId] ? item.expectedHistorical : item.expected;
  const normalizedExpectedValue = useHistorical[tableId] ? item.normalizedExpectedHistorical : item.normalizedExpected;
  
  return (
    <TableRow className={`h-[57px] ${baseClasses} ${depth === 0 ? 'border-b-[1px]' : ''}`}>
      <TableCell className="text-center text-gray-500 text-[10px]">
        {depth === 0 && index}
      </TableCell>
      <TableCell className="border-r border-gray-400">
        <div className="flex items-center gap-2" style={{paddingLeft: `${paddingLeft}px`}}>
          {(depth < 3) && (
            <button 
              onClick={() => toggleClient(item.slug, tableId)}
              className="w-4 h-4 flex items-center justify-center text-gray-500"
            >
              {expandedClients[tableId]?.includes(item.slug) ? '−' : '+'}
            </button>
          )}
          {depth < 3 ? (
            <Link 
              href={`/about-us/${depth === 0 ? 'clients' : depth === 1 ? 'sponsors' : 'cases'}/${item.slug}`} 
              className={`text-blue-600 hover:text-blue-800 ${depth > 0 ? 'text-[12px]' : ''}`}
            >
              {item.name || item.title}
            </Link>
          ) : (
            <span className="text-[12px]">{item.name}</span>
          )}
        </div>
      </TableCell>
      
      {/* Three Months Ago */}
      <TableCellComponent
        value={item.sameDayThreeMonthsAgo}
        normalizedValue={item.normalizedSameDayThreeMonthsAgo}
        totalValue={total.sameDayThreeMonthsAgo}
        normalizedTotalValue={total.normalizedSameDayThreeMonthsAgo}
        className="border-x border-gray-200 text-[12px]"
        normalized={normalized[tableId]}
        highlightYellow={isSignificantlyHigher(item.normalizedThreeMonthsAgo, item.normalizedSameDayThreeMonthsAgo)}
      />
      <TableCellComponent
        value={item.threeMonthsAgo}
        normalizedValue={item.normalizedThreeMonthsAgo}
        totalValue={total.threeMonthsAgo}
        normalizedTotalValue={total.normalizedThreeMonthsAgo}
        className="border-r border-gray-400 text-[12px]"
        normalized={normalized[tableId]}
        highlightYellow={isSignificantlyHigher(item.normalizedThreeMonthsAgo, item.normalizedSameDayThreeMonthsAgo)}
      />

      {/* Two Months Ago */}
      <TableCellComponent
        value={item.sameDayTwoMonthsAgo}
        normalizedValue={item.normalizedSameDayTwoMonthsAgo}
        totalValue={total.sameDayTwoMonthsAgo}
        normalizedTotalValue={total.normalizedSameDayTwoMonthsAgo}
        className="border-x border-gray-200 text-[12px]"
        normalized={normalized[tableId]}
        previousValue={item.sameDayThreeMonthsAgo}
        normalizedPreviousValue={item.normalizedSameDayThreeMonthsAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedTwoMonthsAgo, item.normalizedSameDayTwoMonthsAgo)}
      />
      <TableCellComponent
        value={item.twoMonthsAgo}
        normalizedValue={item.normalizedTwoMonthsAgo}
        totalValue={total.twoMonthsAgo}
        normalizedTotalValue={total.normalizedTwoMonthsAgo}
        className="border-r border-gray-400 text-[12px]"
        normalized={normalized[tableId]}
        previousValue={item.threeMonthsAgo}
        normalizedPreviousValue={item.normalizedThreeMonthsAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedTwoMonthsAgo, item.normalizedSameDayTwoMonthsAgo)}
      />

      {/* One Month Ago */}
      <TableCellComponent
        value={item.sameDayOneMonthAgo}
        normalizedValue={item.normalizedSameDayOneMonthAgo}
        totalValue={total.sameDayOneMonthAgo}
        normalizedTotalValue={total.normalizedSameDayOneMonthAgo}
        className="border-x border-gray-200 text-[12px]"
        normalized={normalized[tableId]}
        previousValue={item.sameDayTwoMonthsAgo}
        normalizedPreviousValue={item.normalizedSameDayTwoMonthsAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedOneMonthAgo, item.normalizedSameDayOneMonthAgo)}
      />
      <TableCellComponent
        value={item.oneMonthAgo}
        normalizedValue={item.normalizedOneMonthAgo}
        totalValue={total.oneMonthAgo}
        normalizedTotalValue={total.normalizedOneMonthAgo}
        className="border-r border-gray-400 text-[12px]"
        normalized={normalized[tableId]}
        previousValue={item.twoMonthsAgo}
        normalizedPreviousValue={item.normalizedTwoMonthsAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedOneMonthAgo, item.normalizedSameDayOneMonthAgo)}
      />

      {/* Current Month */}
      <TableCellComponent
        value={item.realized}
        normalizedValue={item.normalizedRealized}
        totalValue={total.realized}
        normalizedTotalValue={total.normalizedRealized}
        className="border-x border-gray-200"
        normalized={normalized[tableId]}
        previousValue={item.sameDayOneMonthAgo}
        normalizedPreviousValue={item.normalizedSameDayOneMonthAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedRealized, item.normalizedSameDayRealized)}
      />

      <TableCellComponent
        value={item.projected}
        normalizedValue={item.normalizedProjected}
        totalValue={total.projected}
        normalizedTotalValue={total.normalizedProjected}
        className="border-x border-gray-200"
        normalized={normalized[tableId]}
        projected={item.projected}
        normalizedProjected={item.normalizedProjected}
        expected={expectedValue}
        normalizedExpected={normalizedExpectedValue}
        previousValue={item.oneMonthAgo}
        normalizedPreviousValue={item.normalizedOneMonthAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedProjected, item.normalizedSameDayProjected)}
      />
      
      <TableCellComponent
        value={expectedValue}
        normalizedValue={normalizedExpectedValue}
        totalValue={useHistorical[tableId] ? total.expectedHistorical : total.expected}
        normalizedTotalValue={useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected}
        className="border-r border-gray-400"
        normalized={normalized[tableId]}
        projected={item.projected}
        normalizedProjected={item.normalizedProjected}
        expected={expectedValue}
        normalizedExpected={normalizedExpectedValue}
        previousValue={item.oneMonthAgo}
        normalizedPreviousValue={item.normalizedOneMonthAgo}
        highlightYellow={isSignificantlyHigher(item.normalizedExpectedValue, item.normalizedSameDayExpectedValue)}
      />
    </TableRow>
  );
} 