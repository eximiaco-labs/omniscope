import React from "react";
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
import { TableCellComponent } from "./components/TableCell";
import SectionHeader from "@/components/SectionHeader";

interface OtherTableProps {
  title: string;
  tableData: {
    clients: Array<{
      name: string;
      slug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    sponsors: Array<{
      name: string;
      slug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    cases: Array<{
      title: string;
      slug: string;
      sponsorSlug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    projects: Array<{
      name: string;
      slug: string;
      caseSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    totals: {
      threeMonthsAgo: number;
      threeMonthsAgoConsultingPreHours: number;
      twoMonthsAgo: number;
      twoMonthsAgoConsultingPreHours: number;
      oneMonthAgo: number;
      oneMonthAgoConsultingPreHours: number;
      current: number;
      inAnalysisConsultingPreHours: number;
    };
  };
  tableId: string;
  dates: {
    lastDayOfThreeMonthsAgo: string;
    lastDayOfTwoMonthsAgo: string;
    lastDayOfOneMonthAgo: string;
    inAnalysis: string;
  };
  sortConfigs: Record<string, { key: string; direction: "asc" | "desc" }>;
  expandedClients: Record<string, string[]>;
  requestSort: (key: string, tableId: string) => void;
  toggleClient: (clientSlug: string, tableId: string) => void;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Data inválida:", dateString);
      return "Invalid date";
    }
    return format(date, "MMM yyyy");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Invalid date";
  }
};

export function OtherTable({
  title,
  tableData,
  tableId,
  dates,
  sortConfigs,
  expandedClients,
  requestSort,
  toggleClient,
}: OtherTableProps) {
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

  const renderCell = (value: number, totalValue: number, previousValue: number | null = null, className: string = "") => (
    <TableCellComponent
      value={value}
      normalizedValue={value}
      totalValue={totalValue}
      normalizedTotalValue={totalValue}
      previousValue={previousValue}
      normalizedPreviousValue={previousValue}
      normalized={false}
      className={className}
    />
  );

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <SectionHeader title={title} subtitle={total.current.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
      <div className="px-2">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead
                onClick={() => requestSort("threeMonthsAgo", tableId)}
                className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
              >
                {formatDate(dates.lastDayOfThreeMonthsAgo)}{" "}
                {sortConfig.key === "threeMonthsAgo" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                onClick={() => requestSort("twoMonthsAgo", tableId)}
                className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
              >
                {formatDate(dates.lastDayOfTwoMonthsAgo)}{" "}
                {sortConfig.key === "twoMonthsAgo" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                onClick={() => requestSort("oneMonthAgo", tableId)}
                className="text-center border-x w-[95px] cursor-pointer hover:bg-gray-100"
              >
                {formatDate(dates.lastDayOfOneMonthAgo)}{" "}
                {sortConfig.key === "oneMonthAgo" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                onClick={() => requestSort("current", tableId)}
                className="text-center border-x w-[120px] cursor-pointer hover:bg-gray-100"
              >
                {formatDate(dates.inAnalysis)}{" "}
                {sortConfig.key === "current" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client: any, index: number) => (
              <React.Fragment key={client.slug}>
                <TableRow className="h-[57px]">
                  <TableHead className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleClient(client.slug, tableId)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                      >
                        {expandedClients[tableId]?.includes(client.slug)
                          ? "−"
                          : "+"}
                      </button>
                      <Link
                        href={`/about-us/clients/${client.slug}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {client.name}
                      </Link>
                    </div>
                  </TableHead>
                  {renderCell(client.threeMonthsAgo, total.threeMonthsAgo, null, "border-x text-[12px]")}
                  {renderCell(client.twoMonthsAgo, total.twoMonthsAgo, client.threeMonthsAgo, "border-x text-[12px]")}
                  {renderCell(client.oneMonthAgo, total.oneMonthAgo, client.twoMonthsAgo, "border-x text-[12px]")}
                  {renderCell(client.current, total.current, client.oneMonthAgo, "border-x")}
                </TableRow>
                {expandedClients[tableId]?.includes(client.slug) &&
                  tableData.sponsors
                    .filter((sponsor) => sponsor.clientSlug === client.slug)
                    .map((sponsor) => (
                      <React.Fragment key={sponsor.slug}>
                        <TableRow className="h-[57px] bg-gray-50">
                          <TableHead></TableHead>
                          <TableHead className="pl-4">
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  toggleClient(sponsor.slug, tableId)
                                }
                                className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                              >
                                {expandedClients[tableId]?.includes(
                                  sponsor.slug
                                )
                                  ? "−"
                                  : "+"}
                              </button>
                              <Link
                                href={`/about-us/sponsors/${sponsor.slug}`}
                                className="text-blue-600 hover:text-blue-800 text-[14px]"
                              >
                                {sponsor.name}
                              </Link>
                            </div>
                          </TableHead>
                          {renderCell(sponsor.threeMonthsAgo, total.threeMonthsAgo, null, "border-x text-[12px]")}
                          {renderCell(sponsor.twoMonthsAgo, total.twoMonthsAgo, sponsor.threeMonthsAgo, "border-x text-[12px]")}
                          {renderCell(sponsor.oneMonthAgo, total.oneMonthAgo, sponsor.twoMonthsAgo, "border-x text-[12px]")}
                          {renderCell(sponsor.current, total.current, sponsor.oneMonthAgo, "border-x")}
                        </TableRow>
                        {expandedClients[tableId]?.includes(sponsor.slug) &&
                          tableData.cases
                            .filter(
                              (caseItem) =>
                                caseItem.sponsorSlug === sponsor.slug
                            )
                            .map((caseItem) => (
                              <React.Fragment key={caseItem.slug}>
                                <TableRow className="h-[57px] bg-gray-100">
                                  <TableHead></TableHead>
                                  <TableHead className="pl-8">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() =>
                                          toggleClient(caseItem.slug, tableId)
                                        }
                                        className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                                      >
                                        {expandedClients[tableId]?.includes(
                                          caseItem.slug
                                        )
                                          ? "−"
                                          : "+"}
                                      </button>
                                      <Link
                                        href={`/about-us/cases/${caseItem.slug}`}
                                        className="text-blue-600 hover:text-blue-800 text-[12px]"
                                      >
                                        {caseItem.title}
                                      </Link>
                                    </div>
                                  </TableHead>
                                  {renderCell(caseItem.threeMonthsAgo, total.threeMonthsAgo, null, "border-x text-[12px]")}
                                  {renderCell(caseItem.twoMonthsAgo, total.twoMonthsAgo, caseItem.threeMonthsAgo, "border-x text-[12px]")}
                                  {renderCell(caseItem.oneMonthAgo, total.oneMonthAgo, caseItem.twoMonthsAgo, "border-x text-[12px]")}
                                  {renderCell(caseItem.current, total.current, caseItem.oneMonthAgo, "border-x")}
                                </TableRow>
                                {expandedClients[tableId]?.includes(
                                  caseItem.slug
                                ) &&
                                  tableData.projects
                                    .filter(
                                      (project) =>
                                        project.caseSlug === caseItem.slug
                                    )
                                    .map((project) => (
                                      <TableRow
                                        key={project.slug}
                                        className="h-[57px] bg-gray-150"
                                      >
                                        <TableHead></TableHead>
                                        <TableHead className="pl-12">
                                          <span className="text-[12px]">
                                            {project.name}
                                          </span>
                                        </TableHead>
                                        {renderCell(project.threeMonthsAgo, total.threeMonthsAgo, null, "border-x text-[12px]")}
                                        {renderCell(project.twoMonthsAgo, total.twoMonthsAgo, project.threeMonthsAgo, "border-x text-[12px]")}
                                        {renderCell(project.oneMonthAgo, total.oneMonthAgo, project.twoMonthsAgo, "border-x text-[12px]")}
                                        {renderCell(project.current, total.current, project.oneMonthAgo, "border-x")}
                                      </TableRow>
                                    ))}
                              </React.Fragment>
                            ))}
                      </React.Fragment>
                    ))}
              </React.Fragment>
            ))}
            <TableRow className="font-bold border-t-4 h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r">Total</TableCell>
              <TableCellComponent
                value={total.threeMonthsAgo}
                normalizedValue={total.threeMonthsAgo}
                totalValue={total.threeMonthsAgo}
                normalizedTotalValue={total.threeMonthsAgo}
                className="border-x border-gray-200 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={total.twoMonthsAgo}
                normalizedValue={total.twoMonthsAgo}
                totalValue={total.twoMonthsAgo}
                normalizedTotalValue={total.twoMonthsAgo}
                previousValue={total.threeMonthsAgo}
                normalizedPreviousValue={total.threeMonthsAgo}
                className="border-r text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={total.oneMonthAgo}
                normalizedValue={total.oneMonthAgo}
                totalValue={total.oneMonthAgo}
                normalizedTotalValue={total.oneMonthAgo}
                previousValue={total.twoMonthsAgo}
                normalizedPreviousValue={total.twoMonthsAgo}
                className="border-x border-gray-200 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={total.current}
                normalizedValue={total.current}
                totalValue={total.current}
                normalizedTotalValue={total.current}
                previousValue={total.oneMonthAgo}
                normalizedPreviousValue={total.oneMonthAgo}
                className="border-r"
                normalized={false}
              />
            </TableRow>
            {tableId === "consultingPre" && (
              <>
                <TableRow className="h-[57px]">
                  <TableCell className="text-right pr-4"></TableCell>
                  <TableCell className="border-r">Total Hours</TableCell>
                  <TableCellComponent
                    value={total.threeMonthsAgoConsultingPreHours}
                    normalizedValue={total.threeMonthsAgoConsultingPreHours}
                    totalValue={total.threeMonthsAgoConsultingPreHours}
                    normalizedTotalValue={total.threeMonthsAgoConsultingPreHours}
                    className="border-x border-gray-200 text-[12px]"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={total.twoMonthsAgoConsultingPreHours}
                    normalizedValue={total.twoMonthsAgoConsultingPreHours}
                    totalValue={total.twoMonthsAgoConsultingPreHours}
                    normalizedTotalValue={total.twoMonthsAgoConsultingPreHours}
                    previousValue={total.threeMonthsAgoConsultingPreHours}
                    normalizedPreviousValue={total.threeMonthsAgoConsultingPreHours}
                    className="border-r text-[12px]"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={total.oneMonthAgoConsultingPreHours}
                    normalizedValue={total.oneMonthAgoConsultingPreHours}
                    totalValue={total.oneMonthAgoConsultingPreHours}
                    normalizedTotalValue={total.oneMonthAgoConsultingPreHours}
                    previousValue={total.twoMonthsAgoConsultingPreHours}
                    normalizedPreviousValue={total.twoMonthsAgoConsultingPreHours}
                    className="border-x border-gray-200 text-[12px]"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={total.inAnalysisConsultingPreHours}
                    normalizedValue={total.inAnalysisConsultingPreHours}
                    totalValue={total.inAnalysisConsultingPreHours}
                    normalizedTotalValue={total.inAnalysisConsultingPreHours}
                    previousValue={total.oneMonthAgoConsultingPreHours}
                    normalizedPreviousValue={total.oneMonthAgoConsultingPreHours}
                    className="border-r"
                    normalized={false}
                  />
                </TableRow>
                <TableRow className="h-[57px]">
                  <TableCell className="text-right pr-4"></TableCell>
                  <TableCell className="border-r">Average Rate</TableCell>
                  <TableCellComponent
                    value={total.threeMonthsAgoConsultingPreHours ? total.threeMonthsAgo / total.threeMonthsAgoConsultingPreHours : 0}
                    normalizedValue={total.threeMonthsAgoConsultingPreHours ? total.threeMonthsAgo / total.threeMonthsAgoConsultingPreHours : 0}
                    totalValue={total.threeMonthsAgoConsultingPreHours ? total.threeMonthsAgo / total.threeMonthsAgoConsultingPreHours : 0}
                    normalizedTotalValue={total.threeMonthsAgoConsultingPreHours ? total.threeMonthsAgo / total.threeMonthsAgoConsultingPreHours : 0}
                    className="border-x border-gray-200 text-[12px]"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={total.twoMonthsAgoConsultingPreHours ? total.twoMonthsAgo / total.twoMonthsAgoConsultingPreHours : 0}
                    normalizedValue={total.twoMonthsAgoConsultingPreHours ? total.twoMonthsAgo / total.twoMonthsAgoConsultingPreHours : 0}
                    totalValue={total.twoMonthsAgoConsultingPreHours ? total.twoMonthsAgo / total.twoMonthsAgoConsultingPreHours : 0}
                    normalizedTotalValue={total.twoMonthsAgoConsultingPreHours ? total.twoMonthsAgo / total.twoMonthsAgoConsultingPreHours : 0}
                    previousValue={total.threeMonthsAgoConsultingPreHours ? total.threeMonthsAgo / total.threeMonthsAgoConsultingPreHours : 0}
                    normalizedPreviousValue={total.threeMonthsAgoConsultingPreHours ? total.threeMonthsAgo / total.threeMonthsAgoConsultingPreHours : 0}
                    className="border-r text-[12px]"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={total.oneMonthAgoConsultingPreHours ? total.oneMonthAgo / total.oneMonthAgoConsultingPreHours : 0}
                    normalizedValue={total.oneMonthAgoConsultingPreHours ? total.oneMonthAgo / total.oneMonthAgoConsultingPreHours : 0}
                    totalValue={total.oneMonthAgoConsultingPreHours ? total.oneMonthAgo / total.oneMonthAgoConsultingPreHours : 0}
                    normalizedTotalValue={total.oneMonthAgoConsultingPreHours ? total.oneMonthAgo / total.oneMonthAgoConsultingPreHours : 0}
                    previousValue={total.twoMonthsAgoConsultingPreHours ? total.twoMonthsAgo / total.twoMonthsAgoConsultingPreHours : 0}
                    normalizedPreviousValue={total.twoMonthsAgoConsultingPreHours ? total.twoMonthsAgo / total.twoMonthsAgoConsultingPreHours : 0}
                    className="border-x border-gray-200 text-[12px]"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={total.inAnalysisConsultingPreHours ? total.current / total.inAnalysisConsultingPreHours : 0}
                    normalizedValue={total.inAnalysisConsultingPreHours ? total.current / total.inAnalysisConsultingPreHours : 0}
                    totalValue={total.inAnalysisConsultingPreHours ? total.current / total.inAnalysisConsultingPreHours : 0}
                    normalizedTotalValue={total.inAnalysisConsultingPreHours ? total.current / total.inAnalysisConsultingPreHours : 0}
                    previousValue={total.oneMonthAgoConsultingPreHours ? total.oneMonthAgo / total.oneMonthAgoConsultingPreHours : 0}
                    normalizedPreviousValue={total.oneMonthAgoConsultingPreHours ? total.oneMonthAgo / total.oneMonthAgoConsultingPreHours : 0}
                    className="border-r"
                    normalized={false}
                  />
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
