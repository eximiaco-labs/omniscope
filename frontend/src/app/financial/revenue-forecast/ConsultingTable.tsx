import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";
interface ConsultingTableProps {
  title: string;
  tableData: any;
  tableId: string;
  dates: any;
  workingDays: any;
  sortConfigs: Record<string, { key: string; direction: "asc" | "desc" }>;
  expandedClients: Record<string, string[]>;
  useHistorical: Record<string, boolean>;
  normalized: Record<string, boolean>;
  requestSort: (key: string, tableId: string) => void;
  toggleClient: (clientSlug: string, tableId: string) => void;
  setNormalized: (value: React.SetStateAction<Record<string, boolean>>) => void;
  setUseHistorical: (value: React.SetStateAction<Record<string, boolean>>) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number, total: number) => {
  if (total === 0 || value === 0) return "";
  return `${((value / total) * 100).toFixed(1)}%`;
};

export function ConsultingTable({
  title,
  tableData,
  tableId,
  dates,
  workingDays,
  sortConfigs,
  expandedClients,
  useHistorical,
  normalized,
  requestSort,
  toggleClient,
  setNormalized,
  setUseHistorical,
}: ConsultingTableProps) {
  const sortedClients = getSortedClients(tableData.clients, tableId);
  const sortConfig = sortConfigs[tableId];
  const total = tableData.totals;

  function getSortedClients(clients: any[], tableId: string) {
    const sortConfig = sortConfigs[tableId];
    if (!sortConfig?.key) return clients;

    return [...clients].sort((a, b) => {
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

  const calculatePercentageChange = (currentValue: number, previousValue: number | null) => {
    const currentComparisonValue = normalized[tableId] ? currentValue : currentValue;
    const previousComparisonValue = previousValue ? (normalized[tableId] ? previousValue : previousValue) : null;
    
    if (!previousComparisonValue || previousComparisonValue === 0) return null;
    
    const percentageChange = ((currentComparisonValue - previousComparisonValue) / previousComparisonValue) * 100;
    return {
      percentageChange,
      indicator: percentageChange > 0 ? "↑" : percentageChange < 0 ? "↓" : "",
      indicatorColor: percentageChange > 0 ? "text-green-600" : "text-red-600"
    };
  };

  const renderCell = (value: number, normalizedValue: number, totalValue: number, normalizedTotalValue: number, className: string = "", projected?: number, normalizedProjected?: number, expected?: number, normalizedExpected?: number, previousValue: number | null = null, normalizedPreviousValue: number | null = null) => {
    const isProjectedLessThanExpected = projected !== undefined && expected !== undefined && projected < expected;
    const bgColor = isProjectedLessThanExpected ? "bg-red-100" : "";
    
    const displayValue = normalized[tableId] ? normalizedValue : value;
    const displayTotalValue = normalized[tableId] ? normalizedTotalValue : totalValue;

    let changeInfo = null;
    if (previousValue !== null) {
      changeInfo = calculatePercentageChange(
        normalized[tableId] ? normalizedValue : value,
        normalized[tableId] ? normalizedPreviousValue : previousValue
      );
    }

    return (
      <TableCell
        className={`text-right ${className} ${
          value === 0 ? "text-gray-300" : ""
        } relative ${bgColor}`}
      >
        {formatCurrency(displayValue)}
        <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1 box-border">
          <span className={changeInfo ? `${changeInfo.indicatorColor}` : ''}>
            {changeInfo && (
              <>{changeInfo.indicator} {Math.abs(changeInfo.percentageChange).toFixed(1)}%</>
            )}
          </span>
          <span className="text-gray-400 truncate mr-2">
            {formatPercentage(value, totalValue)}
          </span>
        </div>
      </TableCell>
    );
  };

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

  const renderTableHeader = () => (
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

  const renderRow = (item: any, depth: number = 0) => {
    const baseClasses = depth === 1 ? "bg-gray-50" : depth === 2 ? "bg-gray-100" : depth === 3 ? "bg-gray-150" : "";
    const paddingLeft = depth * 4;
    const expectedValue = useHistorical[tableId] ? item.expectedHistorical : item.expected;
    const normalizedExpectedValue = useHistorical[tableId] ? item.normalizedExpectedHistorical : item.normalizedExpected;
    
    return (
      <TableRow key={item.name || item.title} className={`h-[57px] ${baseClasses} ${depth === 0 ? 'border-b-[1px]' : ''}`}>
        <TableCell className="text-center text-gray-500 text-[10px]">
          {depth === 0 && sortedClients.indexOf(item) + 1}
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
        {renderCell(
          item.sameDayThreeMonthsAgo,
          item.normalizedSameDayThreeMonthsAgo,
          total.sameDayThreeMonthsAgo,
          total.normalizedSameDayThreeMonthsAgo,
          "border-x border-gray-200 text-[12px]"
        )}
        {renderCell(
          item.threeMonthsAgo,
          item.normalizedThreeMonthsAgo,
          total.threeMonthsAgo,
          total.normalizedThreeMonthsAgo,
          "border-r border-gray-400 text-[12px]"
        )}
        {renderCell(
          item.sameDayTwoMonthsAgo,
          item.normalizedSameDayTwoMonthsAgo,
          total.sameDayTwoMonthsAgo,
          total.normalizedSameDayTwoMonthsAgo,
          "border-x border-gray-200 text-[12px]",
          undefined,
          undefined,
          undefined,
          undefined,
          item.sameDayThreeMonthsAgo,
          item.normalizedSameDayThreeMonthsAgo
        )}
        {renderCell(
          item.twoMonthsAgo,
          item.normalizedTwoMonthsAgo,
          total.twoMonthsAgo,
          total.normalizedTwoMonthsAgo,
          "border-r border-gray-400 text-[12px]",
          undefined,
          undefined,
          undefined,
          undefined,
          item.threeMonthsAgo,
          item.normalizedThreeMonthsAgo
        )}
        {renderCell(
          item.sameDayOneMonthAgo,
          item.normalizedSameDayOneMonthAgo,
          total.sameDayOneMonthAgo,
          total.normalizedSameDayOneMonthAgo,
          "border-x border-gray-200 text-[12px]",
          undefined,
          undefined,
          undefined,
          undefined,
          item.sameDayTwoMonthsAgo,
          item.normalizedSameDayTwoMonthsAgo
        )}
        {renderCell(
          item.oneMonthAgo,
          item.normalizedOneMonthAgo,
          total.oneMonthAgo,
          total.normalizedOneMonthAgo,
          "border-r border-gray-400 text-[12px]",
          undefined,
          undefined,
          undefined,
          undefined,
          item.twoMonthsAgo,
          item.normalizedTwoMonthsAgo
        )}
        {renderCell(
          item.realized,
          item.normalizedRealized,
          total.realized,
          total.normalizedRealized,
          "border-x border-gray-200",
          undefined,
          undefined,
          undefined,
          undefined,
          item.sameDayOneMonthAgo,
          item.normalizedSameDayOneMonthAgo
        )}
        {renderCell(
          item.projected,
          item.normalizedProjected,
          total.projected,
          total.normalizedProjected,
          "border-x border-gray-200",
          item.projected,
          item.normalizedProjected,
          expectedValue,
          normalizedExpectedValue,
          item.oneMonthAgo,
          item.normalizedOneMonthAgo
        )}
        {renderCell(
          expectedValue,
          normalizedExpectedValue,
          useHistorical[tableId] ? total.expectedHistorical : total.expected,
          useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
          "border-r border-gray-400",
          item.projected,
          item.normalizedProjected,
          expectedValue,
          normalizedExpectedValue,
          item.oneMonthAgo,
          item.normalizedOneMonthAgo
        )}
      </TableRow>
    );
  };

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <div className="flex justify-between items-center">
        <SectionHeader
          title={title}
          subtitle={`${formatCurrency(total.realized)} / ${formatCurrency(useHistorical[tableId] ? total.expectedHistorical : total.expected)}`}
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
          {renderTableHeader()}
          <TableBody>
            {sortedClients.map((client: any) => (
              <React.Fragment key={client.slug}>
                {renderRow(client)}
                {expandedClients[tableId]?.includes(client.slug) && 
                  tableData.sponsors
                    .filter((sponsor: any) => sponsor.clientSlug === client.slug)
                    .map((sponsor: any) => (
                      <React.Fragment key={sponsor.slug}>
                        {renderRow(sponsor, 1)}
                        {expandedClients[tableId]?.includes(sponsor.slug) && 
                          tableData.cases
                            .filter((caseItem: any) => caseItem.sponsorSlug === sponsor.slug)
                            .map((caseItem: any) => (
                              <React.Fragment key={caseItem.slug}>
                                {renderRow(caseItem, 2)}
                                {expandedClients[tableId]?.includes(caseItem.slug) &&
                                  tableData.projects
                                    .filter((project: any) => project.caseSlug === caseItem.slug)
                                    .map((project: any) => (
                                      <React.Fragment key={project.slug}>
                                        {renderRow(project, 3)}
                                      </React.Fragment>
                                    ))
                                }
                              </React.Fragment>
                            ))
                        }
                      </React.Fragment>
                    ))
                }
              </React.Fragment>
            ))}
            <TableRow className="font-bold border-t-4 h-[57px]">
              <TableCell></TableCell>
              <TableCell className="border-r border-gray-400">Total</TableCell>
              {renderCell(
                total.sameDayThreeMonthsAgo,
                total.normalizedSameDayThreeMonthsAgo,
                total.sameDayThreeMonthsAgo,
                total.normalizedSameDayThreeMonthsAgo,
                "border-x border-gray-200 text-[12px]"
              )}
              {renderCell(
                total.threeMonthsAgo,
                total.normalizedThreeMonthsAgo,
                total.threeMonthsAgo,
                total.normalizedThreeMonthsAgo,
                "border-r border-gray-400 text-[12px]"
              )}
              {renderCell(
                total.sameDayTwoMonthsAgo,
                total.normalizedSameDayTwoMonthsAgo,
                total.sameDayTwoMonthsAgo,
                total.normalizedSameDayTwoMonthsAgo,
                "border-x border-gray-200 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.sameDayThreeMonthsAgo,
                total.normalizedSameDayThreeMonthsAgo
              )}
              {renderCell(
                total.twoMonthsAgo,
                total.normalizedTwoMonthsAgo,
                total.twoMonthsAgo,
                total.normalizedTwoMonthsAgo,
                "border-r border-gray-400 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.threeMonthsAgo,
                total.normalizedThreeMonthsAgo
              )}
              {renderCell(
                total.sameDayOneMonthAgo,
                total.normalizedSameDayOneMonthAgo,
                total.sameDayOneMonthAgo,
                total.normalizedSameDayOneMonthAgo,
                "border-x border-gray-200 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.sameDayTwoMonthsAgo,
                total.normalizedSameDayTwoMonthsAgo
              )}
              {renderCell(
                total.oneMonthAgo,
                total.normalizedOneMonthAgo,
                total.oneMonthAgo,
                total.normalizedOneMonthAgo,
                "border-r border-gray-400 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.twoMonthsAgo,
                total.normalizedTwoMonthsAgo
              )}
              {renderCell(
                total.realized,
                total.normalizedRealized,
                total.realized,
                total.normalizedRealized,
                "border-x border-gray-200",
                undefined,
                undefined,
                undefined,
                undefined,
                total.sameDayOneMonthAgo,
                total.normalizedSameDayOneMonthAgo
              )}
              {renderCell(
                total.projected,
                total.normalizedProjected,
                total.projected,
                total.normalizedProjected,
                "border-x border-gray-200",
                total.projected,
                total.normalizedProjected,
                useHistorical[tableId] ? total.expectedHistorical : total.expected,
                useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                total.oneMonthAgo,
                total.normalizedOneMonthAgo
              )}
              {renderCell(
                useHistorical[tableId] ? total.expectedHistorical : total.expected,
                useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                useHistorical[tableId] ? total.expectedHistorical : total.expected,
                useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                "border-r border-gray-400",
                total.projected,
                total.normalizedProjected,
                useHistorical[tableId] ? total.expectedHistorical : total.expected,
                useHistorical[tableId] ? total.normalizedExpectedHistorical : total.normalizedExpected,
                total.oneMonthAgo,
                total.normalizedOneMonthAgo
              )}
            </TableRow>
            <TableRow className="text-gray-600 border-t h-[57px]">
              <TableCell></TableCell>
              <TableCell className="border-r border-gray-400">New Cases</TableCell>
              {renderCell(
                total.sameDayThreeMonthsAgoConsultingFeeNew || 0,
                (total.sameDayThreeMonthsAgoConsultingFeeNew || 0) / workingDays.sameDayThreeMonthsAgo,
                total.sameDayThreeMonthsAgo,
                total.normalizedSameDayThreeMonthsAgo,
                "border-x border-gray-200 text-[12px]"
              )}
              {renderCell(
                total.threeMonthsAgoConsultingFeeNew || 0,
                (total.threeMonthsAgoConsultingFeeNew || 0) / workingDays.threeMonthsAgo,
                total.threeMonthsAgo,
                total.normalizedThreeMonthsAgo,
                "border-r border-gray-400 text-[12px]"
              )}
              {renderCell(
                total.sameDayTwoMonthsAgoConsultingFeeNew || 0,
                (total.sameDayTwoMonthsAgoConsultingFeeNew || 0) / workingDays.sameDayTwoMonthsAgo,
                total.sameDayTwoMonthsAgo,
                total.normalizedSameDayTwoMonthsAgo,
                "border-x border-gray-200 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.sameDayThreeMonthsAgoConsultingFeeNew || 0,
                (total.sameDayThreeMonthsAgoConsultingFeeNew || 0) / workingDays.sameDayThreeMonthsAgo
              )}
              {renderCell(
                total.twoMonthsAgoConsultingFeeNew || 0,
                (total.twoMonthsAgoConsultingFeeNew || 0) / workingDays.twoMonthsAgo,
                total.twoMonthsAgo,
                total.normalizedTwoMonthsAgo,
                "border-r border-gray-400 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.threeMonthsAgoConsultingFeeNew || 0,
                (total.threeMonthsAgoConsultingFeeNew || 0) / workingDays.threeMonthsAgo
              )}
              {renderCell(
                total.sameDayOneMonthAgoConsultingFeeNew || 0,
                (total.sameDayOneMonthAgoConsultingFeeNew || 0) / workingDays.sameDayOneMonthAgo,
                total.sameDayOneMonthAgo,
                total.normalizedSameDayOneMonthAgo,
                "border-x border-gray-200 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.sameDayTwoMonthsAgoConsultingFeeNew || 0,
                (total.sameDayTwoMonthsAgoConsultingFeeNew || 0) / workingDays.sameDayTwoMonthsAgo
              )}
              {renderCell(
                total.oneMonthAgoConsultingFeeNew || 0,
                (total.oneMonthAgoConsultingFeeNew || 0) / workingDays.oneMonthAgo,
                total.oneMonthAgo,
                total.normalizedOneMonthAgo,
                "border-r border-gray-400 text-[12px]",
                undefined,
                undefined,
                undefined,
                undefined,
                total.twoMonthsAgoConsultingFeeNew || 0,
                (total.twoMonthsAgoConsultingFeeNew || 0) / workingDays.twoMonthsAgo
              )}
              {renderCell(
                total.realizedConsultingFeeNew || 0,
                (total.realizedConsultingFeeNew || 0) / workingDays.inAnalysisPartial,
                total.realized,
                total.normalizedRealized,
                "border-x border-gray-200",
                undefined,
                undefined,
                undefined,
                undefined,
                total.sameDayOneMonthAgoConsultingFeeNew || 0,
                (total.sameDayOneMonthAgoConsultingFeeNew || 0) / workingDays.sameDayOneMonthAgo
              )}
              <TableCell className="text-right border-x border-gray-200">-</TableCell>
              <TableCell className="text-right border-r border-gray-400">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 