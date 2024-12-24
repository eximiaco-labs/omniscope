import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";
import { TableHeaderFuture } from "./components/TableHeaderFuture";
import { TableRowFuture } from "./components/TableRowFuture";
import { TableCellComponent } from "./components/TableCell";
import { formatCurrency } from "./utils";

interface ConsultingTableFutureProps {
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

export function ConsultingTableFuture({
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
}: ConsultingTableFutureProps) {
  const sortedClients = getSortedClients(tableData.clients, tableId);
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

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <div className="flex justify-between items-center">
        <SectionHeader
          title={title}
          subtitle="Next three months"
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
          <TableHeaderFuture 
            dates={dates}
            workingDays={workingDays}
            tableId={tableId}
            normalized={normalized}
            sortConfigs={sortConfigs}
            requestSort={requestSort}
          />
          <TableBody>
            {sortedClients.map((client: any, index: number) => (
              <React.Fragment key={client.slug}>
                <TableRowFuture 
                  item={client}
                  index={index + 1}
                  total={total}
                  tableId={tableId}
                  normalized={normalized}
                  expandedClients={expandedClients}
                  toggleClient={toggleClient}
                />
                {expandedClients[tableId]?.includes(client.slug) && (
                  <>
                    {tableData.sponsors
                      .filter((sponsor: any) => sponsor.clientSlug === client.slug)
                      .map((sponsor: any) => (
                        <React.Fragment key={sponsor.slug}>
                          <TableRowFuture 
                            item={sponsor}
                            index={null}
                            depth={1}
                            total={total}
                            tableId={tableId}
                            normalized={normalized}
                            expandedClients={expandedClients}
                            toggleClient={toggleClient}
                          />
                          {expandedClients[tableId]?.includes(sponsor.slug) && 
                            tableData.cases
                              .filter((case_: any) => case_.sponsorSlug === sponsor.slug)
                              .map((case_: any) => (
                                <React.Fragment key={case_.slug}>
                                  <TableRowFuture 
                                    item={case_}
                                    index={null}
                                    depth={2}
                                    total={total}
                                    tableId={tableId}
                                    normalized={normalized}
                                    expandedClients={expandedClients}
                                    toggleClient={toggleClient}
                                  />
                                  {expandedClients[tableId]?.includes(case_.slug) &&
                                    tableData.projects
                                      .filter((project: any) => project.caseSlug === case_.slug)
                                      .map((project: any) => (
                                        <TableRowFuture
                                          key={project.slug}
                                          item={project}
                                          index={null}
                                          depth={3}
                                          total={total}
                                          tableId={tableId}
                                          normalized={normalized}
                                          expandedClients={expandedClients}
                                          toggleClient={toggleClient}
                                        />
                                      ))
                                  }
                                </React.Fragment>
                              ))
                          }
                        </React.Fragment>
                      ))
                    }
                  </>
                )}
              </React.Fragment>
            ))}
            <TableRow className="font-bold border-t-4 h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r border-gray-400">Total</TableCell>
              <TableCellComponent
                value={total.realized}
                normalizedValue={total.normalizedRealized}
                totalValue={total.realized}
                normalizedTotalValue={total.normalizedRealized}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.projected}
                normalizedValue={total.normalizedProjected}
                totalValue={total.projected}
                normalizedTotalValue={total.normalizedProjected}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.expected}
                normalizedValue={total.normalizedExpected}
                totalValue={total.expected}
                normalizedTotalValue={total.normalizedExpected}
                className="border-r border-gray-400"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.expectedOneMonthLater}
                normalizedValue={total.normalizedExpectedOneMonthLater}
                totalValue={total.expectedOneMonthLater}
                normalizedTotalValue={total.normalizedExpectedOneMonthLater}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.expectedTwoMonthsLater}
                normalizedValue={total.normalizedExpectedTwoMonthsLater}
                totalValue={total.expectedTwoMonthsLater}
                normalizedTotalValue={total.normalizedExpectedTwoMonthsLater}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.expectedThreeMonthsLater}
                normalizedValue={total.normalizedExpectedThreeMonthsLater}
                totalValue={total.expectedThreeMonthsLater}
                normalizedTotalValue={total.normalizedExpectedThreeMonthsLater}
                className="border-r border-gray-400"
                normalized={normalized[tableId]}
              />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 