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
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString);
      return 'Invalid date';
    }
    return format(date, "MMM yyyy");
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Invalid date';
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

  const renderCell = (value: number, total: number, className: string = "") => (
    <TableCell className={`text-right ${className} ${value === 0 ? "text-gray-300" : ""} relative`}>
      {formatCurrency(value)}
      <span className="absolute bottom-0 right-1 text-[10px] text-gray-400">
        {value === 0 || total === 0 ? "" : `${((value / total) * 100).toFixed(1)}%`}
      </span>
    </TableCell>
  );

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <SectionHeader title={title} subtitle={formatCurrency(total.current)} />
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
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleClient(client.slug, tableId)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                      >
                        {expandedClients[tableId]?.includes(client.slug) ? '−' : '+'}
                      </button>
                      <Link href={`/about-us/clients/${client.slug}`} className="text-blue-600 hover:text-blue-800">
                        {client.name}
                      </Link>
                    </div>
                  </TableCell>
                  {renderCell(client.threeMonthsAgo, total.threeMonthsAgo, "border-x text-[12px]")}
                  {renderCell(client.twoMonthsAgo, total.twoMonthsAgo, "border-x text-[12px]")}
                  {renderCell(client.oneMonthAgo, total.oneMonthAgo, "border-x text-[12px]")}
                  {renderCell(client.current, total.current, "border-x")}
                </TableRow>
                {expandedClients[tableId]?.includes(client.slug) && 
                  tableData.sponsors
                    .filter((sponsor) => sponsor.clientSlug === client.slug)
                    .map((sponsor) => (
                      <React.Fragment key={sponsor.slug}>
                        <TableRow className="h-[57px] bg-gray-50">
                          <TableCell></TableCell>
                          <TableCell className="pl-4">
                            <div className="flex items-center">
                              <button 
                                onClick={() => toggleClient(sponsor.slug, tableId)}
                                className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                              >
                                {expandedClients[tableId]?.includes(sponsor.slug) ? '−' : '+'}
                              </button>
                              <Link href={`/about-us/sponsors/${sponsor.slug}`} className="text-blue-600 hover:text-blue-800 text-[14px]">
                                {sponsor.name}
                              </Link>
                            </div>
                          </TableCell>
                          {renderCell(sponsor.threeMonthsAgo, total.threeMonthsAgo, "border-x text-[12px]")}
                          {renderCell(sponsor.twoMonthsAgo, total.twoMonthsAgo, "border-x text-[12px]")}
                          {renderCell(sponsor.oneMonthAgo, total.oneMonthAgo, "border-x text-[12px]")}
                          {renderCell(sponsor.current, total.current, "border-x")}
                        </TableRow>
                        {expandedClients[tableId]?.includes(sponsor.slug) && 
                          tableData.cases
                            .filter((caseItem) => caseItem.sponsorSlug === sponsor.slug)
                            .map((caseItem) => (
                              <React.Fragment key={caseItem.slug}>
                                <TableRow className="h-[57px] bg-gray-100">
                                  <TableCell></TableCell>
                                  <TableCell className="pl-8">
                                    <div className="flex items-center">
                                      <button 
                                        onClick={() => toggleClient(caseItem.slug, tableId)}
                                        className="w-4 h-4 flex items-center justify-center text-gray-500 mr-1"
                                      >
                                        {expandedClients[tableId]?.includes(caseItem.slug) ? '−' : '+'}
                                      </button>
                                      <Link href={`/about-us/cases/${caseItem.slug}`} className="text-blue-600 hover:text-blue-800 text-[12px]">
                                        {caseItem.title}
                                      </Link>
                                    </div>
                                  </TableCell>
                                  {renderCell(caseItem.threeMonthsAgo, total.threeMonthsAgo, "border-x text-[12px]")}
                                  {renderCell(caseItem.twoMonthsAgo, total.twoMonthsAgo, "border-x text-[12px]")}
                                  {renderCell(caseItem.oneMonthAgo, total.oneMonthAgo, "border-x text-[12px]")}
                                  {renderCell(caseItem.current, total.current, "border-x")}
                                </TableRow>
                                {expandedClients[tableId]?.includes(caseItem.slug) &&
                                  tableData.projects
                                    .filter((project) => project.caseSlug === caseItem.slug)
                                    .map((project) => (
                                      <TableRow key={project.slug} className="h-[57px] bg-gray-150">
                                        <TableCell></TableCell>
                                        <TableCell className="pl-12">
                                          <span className="text-[12px]">{project.name}</span>
                                        </TableCell>
                                        {renderCell(project.threeMonthsAgo, total.threeMonthsAgo, "border-x text-[12px]")}
                                        {renderCell(project.twoMonthsAgo, total.twoMonthsAgo, "border-x text-[12px]")}
                                        {renderCell(project.oneMonthAgo, total.oneMonthAgo, "border-x text-[12px]")}
                                        {renderCell(project.current, total.current, "border-x")}
                                      </TableRow>
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
            <TableRow className="font-bold border-t-2 h-[57px]">
              <TableCell></TableCell>
              <TableCell>Total</TableCell>
              {renderCell(total.threeMonthsAgo, total.threeMonthsAgo, "border-x text-[12px]")}
              {renderCell(total.twoMonthsAgo, total.twoMonthsAgo, "border-x text-[12px]")}
              {renderCell(total.oneMonthAgo, total.oneMonthAgo, "border-x text-[12px]")}
              {renderCell(total.current, total.current, "border-x")}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 