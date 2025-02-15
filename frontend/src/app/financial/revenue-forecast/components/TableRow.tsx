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
  hideIndex?: boolean;
  hideExpansion?: boolean;
  contentType?: string;
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
  hideIndex = false,
  hideExpansion = false,
  contentType = "consulting",
}: TableRowProps) {
  const baseClasses = depth === 1 ? "bg-gray-50" : depth === 2 ? "bg-gray-100" : depth === 3 ? "bg-gray-150" : "";
  const paddingLeft = depth * 4;
  const expectedValue = useHistorical[tableId] ? item.expectedHistorical : item.expected;
  const normalizedExpectedValue = useHistorical[tableId] ? item.normalizedExpectedHistorical : item.normalizedExpected;
  
  const renderCaseDetails = (item: any) => {
    if (depth === 2) { // Only render for cases (depth === 2)
      return (
        <div className="text-[10px] mt-1">
          {item.endOfContract && (
            <div className="flex items-center text-gray-700">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-red-600 font-medium">
                {new Date(item.endOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
          {item.weeklyApprovedHours !== undefined ? (
            <div className="flex items-center text-gray-600 mt-0.5">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{item.weeklyApprovedHours}h/week</span>
            </div>
          ): ""}
        </div>
      );
    }
    return null;
  };
  
  return (
    <TableRow className={`h-[57px] ${baseClasses} ${depth === 0 ? 'border-b-[1px]' : ''}`}>
      <TableCell className="text-center text-gray-500 text-[10px]">
        {index}
      </TableCell>
      <TableCell className="border-r border-gray-400">
        {depth === 2 ? (
          <div className="flex items-start gap-2 min-h-[45px]" style={{paddingLeft: `${paddingLeft}px`}}>
            {!hideExpansion && (
              <button 
                onClick={() => toggleClient(item.slug, tableId)}
                className="w-4 h-4 flex items-center justify-center text-gray-500 mt-0.5"
              >
                {expandedClients[tableId]?.includes(item.slug) ? '−' : '+'}
              </button>
            )}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <Link 
                  href={`/about-us/cases/${item.slug}`}
                  className="text-blue-600 hover:text-blue-800 text-[12px]"
                >
                  {item.name || item.title}
                </Link>
              </div>
              {renderCaseDetails(item)}
            </div>
          </div>
        ) : (
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
                href={`/${contentType !== 'consulting-and-engineers' ? (depth === 0 ? 'engagements/clients' : depth === 1 ? 'engagements/sponsors' : 'engagements/cases') : 'team/consultants-and-engineers'}/${item.slug}`}
                className={`text-blue-600 hover:text-blue-800 ${depth > 0 ? 'text-[12px]' : ''}`}
              >
                {item.name || item.title}
              </Link>
            ) : (
              <span className="text-[12px]">{item.name}</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Three Months Ago */}
      <TableCellComponent
        value={item.sameDayThreeMonthsAgo}
        normalizedValue={item.normalizedSameDayThreeMonthsAgo}
        totalValue={total.sameDayThreeMonthsAgo}
        normalizedTotalValue={total.normalizedSameDayThreeMonthsAgo}
        hours={item.sameDayThreeMonthsAgoConsultingHours}
        normalizedHours={item.normalizedSameDayThreeMonthsAgoConsultingHours}
        className="border-x border-gray-200 text-[12px]"
        normalized={normalized[tableId]}
        highlightYellow={isSignificantlyHigher(item.normalizedThreeMonthsAgo, item.normalizedSameDayThreeMonthsAgo)}
      />
      <TableCellComponent
        value={item.threeMonthsAgo}
        normalizedValue={item.normalizedThreeMonthsAgo}
        totalValue={total.threeMonthsAgo}
        normalizedTotalValue={total.normalizedThreeMonthsAgo}
        hours={item.threeMonthsAgoConsultingHours}
        normalizedHours={item.normalizedThreeMonthsAgoConsultingHours}
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
        hours={item.sameDayTwoMonthsAgoConsultingHours}
        normalizedHours={item.normalizedSameDayTwoMonthsAgoConsultingHours}
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
        hours={item.twoMonthsAgoConsultingHours}
        normalizedHours={item.normalizedTwoMonthsAgoConsultingHours}
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
        hours={item.sameDayOneMonthAgoConsultingHours}
        normalizedHours={item.normalizedSameDayOneMonthAgoConsultingHours}
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
        hours={item.oneMonthAgoConsultingHours}
        normalizedHours={item.normalizedOneMonthAgoConsultingHours}
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
        hours={item.inAnalysisConsultingHours}
        normalizedHours={item.normalizedInAnalysisConsultingHours}
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