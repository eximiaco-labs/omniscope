import React from "react";
import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { TableCellComponent } from "./TableCell";

interface TableRowFutureProps {
  item: any;
  index: number | null;
  depth?: number;
  total: any;
  tableId: string;
  normalized: Record<string, boolean>;
  expandedClients: Record<string, string[]>;
  toggleClient: (clientSlug: string, tableId: string) => void;
  hideIndex?: boolean;
  hideExpansion?: boolean;
}

export function TableRowFuture({
  item,
  index,
  depth = 0,
  total,
  tableId,
  normalized,
  expandedClients,
  toggleClient,
  hideIndex = false,
  hideExpansion = false,
}: TableRowFutureProps) {
  const baseClasses = depth === 1 ? "bg-gray-50" : depth === 2 ? "bg-gray-100" : depth === 3 ? "bg-gray-150" : "";
  const paddingLeft = depth * 4;
  
  return (
    <TableRow className={`h-[57px] ${baseClasses} ${depth === 0 ? 'border-b-[1px]' : ''}`}>
      <TableCell className="text-center text-gray-500 text-[10px]">
        {index}
      </TableCell>
      <TableCell className="border-r border-gray-400">
        <div className="flex items-center gap-2" style={{paddingLeft: `${paddingLeft}px`}}>
          {!hideExpansion && (depth < 3) && (
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
      
      {/* Current Month */}
      <TableCellComponent
        value={item.realized}
        normalizedValue={item.normalizedRealized}
        totalValue={total.realized}
        normalizedTotalValue={total.normalizedRealized}
        className="border-x border-gray-200"
        normalized={normalized[tableId]}
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
        expected={item.expected}
        normalizedExpected={item.normalizedExpected}
      />
      <TableCellComponent
        value={item.expected}
        normalizedValue={item.normalizedExpected}
        totalValue={total.expected}
        normalizedTotalValue={total.normalizedExpected}
        className="border-r border-gray-400"
        normalized={normalized[tableId]}
        projected={item.projected}
        normalizedProjected={item.normalizedProjected}
        expected={item.expected}
        normalizedExpected={item.normalizedExpected}
      />

      {/* Future Months */}
      <TableCellComponent
        value={item.expectedOneMonthLater}
        normalizedValue={item.normalizedExpectedOneMonthLater}
        totalValue={total.expectedOneMonthLater}
        normalizedTotalValue={total.normalizedExpectedOneMonthLater}
        previousValue={item.expected}
        normalizedPreviousValue={item.normalizedExpected}
        className="border-x border-gray-200 text-[12px]"
        normalized={normalized[tableId]}
      />
      <TableCellComponent
        value={item.expectedTwoMonthsLater}
        normalizedValue={item.normalizedExpectedTwoMonthsLater}
        totalValue={total.expectedTwoMonthsLater}
        normalizedTotalValue={total.normalizedExpectedTwoMonthsLater}
        previousValue={item.expectedOneMonthLater}
        normalizedPreviousValue={item.normalizedExpectedOneMonthLater}
        className="border-x border-gray-200 text-[12px]"
        normalized={normalized[tableId]}
      />
      <TableCellComponent
        value={item.expectedThreeMonthsLater}
        normalizedValue={item.normalizedExpectedThreeMonthsLater}
        totalValue={total.expectedThreeMonthsLater}
        normalizedTotalValue={total.normalizedExpectedThreeMonthsLater}
        previousValue={item.expectedTwoMonthsLater}
        normalizedPreviousValue={item.normalizedExpectedTwoMonthsLater}
        className="border-r border-gray-400 text-[12px]"
        normalized={normalized[tableId]}
      />
    </TableRow>
  );
} 