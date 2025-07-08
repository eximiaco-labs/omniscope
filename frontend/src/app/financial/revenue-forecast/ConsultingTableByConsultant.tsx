import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";
import { TableHeaderComponent } from "./components/TableHeader";
import { TableRowComponent } from "./components/TableRow";
import { TableCellComponent } from "./components/TableCell";
import { formatCurrency } from "./utils";

interface ConsultingTableByConsultantProps {
  title: string;
  tableData: any;
  tableId: string;
  dates: any;
  workingDays: any;
  sortConfigs: Record<string, { key: string; direction: "asc" | "desc" }>;
  normalized: Record<string, boolean>;
  requestSort: (key: string, tableId: string) => void;
  setNormalized: (value: React.SetStateAction<Record<string, boolean>>) => void;
}

export function ConsultingTableByConsultant({
  title,
  tableData,
  tableId,
  dates,
  workingDays,
  sortConfigs,
  normalized,
  requestSort,
  setNormalized,
}: ConsultingTableByConsultantProps) {
  const sortedConsultants = getSortedConsultants(tableData.consultants, tableId);
  const total = tableData.totals;

  function getSortedConsultants(consultants: any[], tableId: string) {
    const sortConfig = sortConfigs[tableId];
    if (!sortConfig?.key) return consultants;

    return [...consultants].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <div className="flex justify-between items-center">
        <SectionHeader
          title={title}
          subtitle="By Consultant"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Normalized</span>
          <button
            onClick={() => setNormalized(prev => ({
              ...prev,
              [tableId]: !prev[tableId]
            }))}
            className={`
              w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
              ${normalized[tableId] ? 'bg-blue-600' : 'bg-gray-200'}
              relative
            `}
          >
            <span
              className={`
                absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
                ${normalized[tableId] ? 'transform translate-x-6' : ''}
              `}
            />
          </button>
        </div>
      </div>
      <div className="px-2">
        <Table>
          <TableHeaderComponent 
            dates={dates}
            workingDays={workingDays}
            tableId={tableId}
            normalized={normalized}
            sortConfigs={sortConfigs}
            useHistorical={{ [tableId]: true }}
            requestSort={requestSort}
            setUseHistorical={() => {}}
            columnLabel="Consultant"
            hideHistoricalToggle={true}
          />
          <TableBody>
            {sortedConsultants.map((consultant: any, index: number) => (
              <TableRowComponent 
                key={consultant.slug}
                index={index + 1}
                item={consultant}
                total={total}
                tableId={tableId}
                normalized={normalized}
                useHistorical={{ [tableId]: true }}
                expandedClients={{}}
                toggleClient={() => {}}
                hideExpansion={true}
                contentType="consulting-or-engineers"
              />
            ))}
            <TableRow className="font-bold border-t-4 h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r border-gray-400">Total</TableCell>
              <TableCellComponent
                value={total.sameDayThreeMonthsAgo}
                normalizedValue={total.normalizedSameDayThreeMonthsAgo}
                totalValue={total.sameDayThreeMonthsAgo}
                normalizedTotalValue={total.normalizedSameDayThreeMonthsAgo}
                hours={total.sameDayThreeMonthsAgoConsultingHours}
                normalizedHours={total.normalizedSameDayThreeMonthsAgoConsultingHours}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.threeMonthsAgo}
                normalizedValue={total.normalizedThreeMonthsAgo}
                totalValue={total.threeMonthsAgo}
                normalizedTotalValue={total.normalizedThreeMonthsAgo}
                hours={total.threeMonthsAgoConsultingHours}
                normalizedHours={total.normalizedThreeMonthsAgoConsultingHours}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.sameDayTwoMonthsAgo}
                normalizedValue={total.normalizedSameDayTwoMonthsAgo}
                totalValue={total.sameDayTwoMonthsAgo}
                normalizedTotalValue={total.normalizedSameDayTwoMonthsAgo}
                hours={total.sameDayTwoMonthsAgoConsultingHours}
                normalizedHours={total.normalizedSameDayTwoMonthsAgoConsultingHours}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.sameDayThreeMonthsAgo}
                normalizedPreviousValue={total.normalizedSameDayThreeMonthsAgo}
              />
              <TableCellComponent
                value={total.twoMonthsAgo}
                normalizedValue={total.normalizedTwoMonthsAgo}
                totalValue={total.twoMonthsAgo}
                normalizedTotalValue={total.normalizedTwoMonthsAgo}
                hours={total.twoMonthsAgoConsultingHours}
                normalizedHours={total.normalizedTwoMonthsAgoConsultingHours}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.threeMonthsAgo}
                normalizedPreviousValue={total.normalizedThreeMonthsAgo}
              />
              <TableCellComponent
                value={total.sameDayOneMonthAgo}
                normalizedValue={total.normalizedSameDayOneMonthAgo}
                totalValue={total.sameDayOneMonthAgo}
                normalizedTotalValue={total.normalizedSameDayOneMonthAgo}
                hours={total.sameDayOneMonthAgoConsultingHours}
                normalizedHours={total.normalizedSameDayOneMonthAgoConsultingHours}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.sameDayTwoMonthsAgo}
                normalizedPreviousValue={total.normalizedSameDayTwoMonthsAgo}
              />
              <TableCellComponent
                value={total.oneMonthAgo}
                normalizedValue={total.normalizedOneMonthAgo}
                totalValue={total.oneMonthAgo}
                normalizedTotalValue={total.normalizedOneMonthAgo}
                hours={total.oneMonthAgoConsultingHours}
                normalizedHours={total.normalizedOneMonthAgoConsultingHours}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.twoMonthsAgo}
                normalizedPreviousValue={total.normalizedTwoMonthsAgo}
              />
              <TableCellComponent
                value={total.realized}
                normalizedValue={total.normalizedRealized}
                totalValue={total.realized}
                normalizedTotalValue={total.normalizedRealized}
                hours={total.inAnalysisConsultingHours}
                normalizedHours={total.normalizedInAnalysisConsultingHours}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
                previousValue={total.sameDayOneMonthAgo}
                normalizedPreviousValue={total.normalizedSameDayOneMonthAgo}
              />
              <TableCellComponent
                value={total.projected}
                normalizedValue={total.normalizedProjected}
                totalValue={total.projected}
                normalizedTotalValue={total.normalizedProjected}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
                projected={total.projected}
                normalizedProjected={total.normalizedProjected}
                expected={total.expectedHistorical}
                normalizedExpected={total.normalizedExpectedHistorical}
                previousValue={total.oneMonthAgo}
                normalizedPreviousValue={total.normalizedOneMonthAgo}
              />
              <TableCellComponent
                value={total.expectedHistorical}
                normalizedValue={total.normalizedExpectedHistorical}
                totalValue={total.expectedHistorical}
                normalizedTotalValue={total.normalizedExpectedHistorical}
                className="border-r border-gray-400"
                normalized={normalized[tableId]}
                projected={total.projected}
                normalizedProjected={total.normalizedProjected}
                expected={total.expectedHistorical}
                normalizedExpected={total.normalizedExpectedHistorical}
                previousValue={total.oneMonthAgo}
                normalizedPreviousValue={total.normalizedOneMonthAgo}
              />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
