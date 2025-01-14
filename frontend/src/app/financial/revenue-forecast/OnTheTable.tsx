import { Table, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";
import { TableCellComponent } from "./components/TableCell";
import { formatCurrency } from "./utils";
import Link from "next/link";

interface OnTheTableProps {
  title: string;
  tableData: any;
  tableId: string;
  normalized: Record<string, boolean>;
  useHistorical: Record<string, boolean>;
  setUseHistorical: (value: React.SetStateAction<Record<string, boolean>>) => void;
}

export function OnTheTable({
  title,
  tableData,
  tableId,
  normalized,
  useHistorical,
  setUseHistorical,
}: OnTheTableProps) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "waste", direction: "desc" });

  // Filter clients where Expected > Projected
  const clientsWithWaste = tableData.clients.filter((client: any) => {
    const expected = useHistorical[tableId]
      ? client.expectedHistorical
      : client.expected;
    return expected > client.projected;
  });

  // Sort clients based on current sort configuration
  const sortedClients = React.useMemo(() => {
    const sorted = [...clientsWithWaste];
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case "projected":
          aValue = a.projected;
          bValue = b.projected;
          break;
        case "expected":
          aValue = useHistorical[tableId] ? a.expectedHistorical : a.expected;
          bValue = useHistorical[tableId] ? b.expectedHistorical : b.expected;
          break;
        case "waste":
          aValue = (useHistorical[tableId] ? a.expectedHistorical : a.expected) - a.projected;
          bValue = (useHistorical[tableId] ? b.expectedHistorical : b.expected) - b.projected;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [clientsWithWaste, sortConfig, useHistorical, tableId]);

  // Calculate total waste
  const totalWaste = sortedClients.reduce((acc: number, client: any) => {
    const expected = useHistorical[tableId]
      ? client.expectedHistorical
      : client.expected;
    return acc + (expected - client.projected);
  }, 0);

  const requestSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <div className="flex justify-between items-center">
        <SectionHeader
          title={title}
          subtitle={`Total waste: ${formatCurrency(totalWaste)}`}
        />
      </div>
      <div className="px-2">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableCell rowSpan={2} className="w-[50px] text-center">#</TableCell>
              <TableCell 
                className="border-r border-gray-400 cursor-pointer"
                onClick={() => requestSort("name")}
              >
                Client
                {sortConfig.key === "name" && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
              </TableCell>
              <TableCell 
                className="text-right border-x border-gray-200 cursor-pointer w-[120px]"
                onClick={() => requestSort("projected")}
              >
                Projected
                {sortConfig.key === "projected" && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
              </TableCell>
              <TableCell className="text-right border-x border-gray-200 w-[120px]">
                <div className="flex flex-col items-end">
                  <span 
                    onClick={() => requestSort("expected")} 
                    className="cursor-pointer hover:text-gray-600"
                  >
                    Expected {sortConfig.key === "expected" && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
              </TableCell>
              <TableCell 
                className="text-right border-r border-gray-400 cursor-pointer w-[120px]"
                onClick={() => requestSort("waste")}
              >
                Waste
                {sortConfig.key === "waste" && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client: any, index: number) => {
              const expected = useHistorical[tableId]
                ? client.expectedHistorical
                : client.expected;
              const waste = expected - client.projected;

              // Calculate column totals
              const projectedTotal = sortedClients.reduce(
                (acc: number, c: any) => acc + c.projected,
                0
              );
              const expectedTotal = sortedClients.reduce(
                (acc: number, c: any) => acc + (useHistorical[tableId] ? c.expectedHistorical : c.expected),
                0
              );
              const wasteTotal = sortedClients.reduce(
                (acc: number, c: any) => {
                  const cExpected = useHistorical[tableId] ? c.expectedHistorical : c.expected;
                  return acc + (cExpected - c.projected);
                },
                0
              );

              return (
                <TableRow
                  key={client.slug}
                  className="border-b border-gray-200 h-[57px]"
                >
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-r border-gray-400">
                    <Link 
                      href={`/about-us/clients/${client.slug}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCellComponent
                    value={client.projected}
                    normalizedValue={client.normalizedProjected}
                    totalValue={projectedTotal}
                    normalizedTotalValue={projectedTotal}
                    className="border-x border-gray-200"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={expected}
                    normalizedValue={
                      useHistorical[tableId]
                        ? client.normalizedExpectedHistorical
                        : client.normalizedExpected
                    }
                    totalValue={expectedTotal}
                    normalizedTotalValue={expectedTotal}
                    className="border-x border-gray-200"
                    normalized={false}
                  />
                  <TableCellComponent
                    value={waste}
                    normalizedValue={waste}
                    totalValue={wasteTotal}
                    normalizedTotalValue={wasteTotal}
                    className="border-r border-gray-400"
                    normalized={false}
                  />
                </TableRow>
              );
            })}
            <TableRow className="font-bold border-t-4 h-[57px]">
              <TableCell className="text-center text-gray-500 text-[10px]"></TableCell>
              <TableCell className="border-r border-gray-400">Total</TableCell>
              <TableCellComponent
                value={sortedClients.reduce(
                  (acc: number, client: any) => acc + client.projected,
                  0
                )}
                normalizedValue={sortedClients.reduce(
                  (acc: number, client: any) => acc + client.projected,
                  0
                )}
                totalValue={sortedClients.reduce(
                  (acc: number, client: any) => acc + client.projected,
                  0
                )}
                normalizedTotalValue={sortedClients.reduce(
                  (acc: number, client: any) => acc + client.projected,
                  0
                )}
                className="border-x border-gray-200"
                normalized={false}
              />
              <TableCellComponent
                value={sortedClients.reduce((acc: number, client: any) => {
                  const expected = useHistorical[tableId]
                    ? client.expectedHistorical
                    : client.expected;
                  return acc + expected;
                }, 0)}
                normalizedValue={sortedClients.reduce((acc: number, client: any) => {
                  const expected = useHistorical[tableId]
                    ? client.expectedHistorical
                    : client.expected;
                  return acc + expected;
                }, 0)}
                totalValue={sortedClients.reduce((acc: number, client: any) => {
                  const expected = useHistorical[tableId]
                    ? client.expectedHistorical
                    : client.expected;
                  return acc + expected;
                }, 0)}
                normalizedTotalValue={sortedClients.reduce((acc: number, client: any) => {
                  const expected = useHistorical[tableId]
                    ? client.expectedHistorical
                    : client.expected;
                  return acc + expected;
                }, 0)}
                className="border-x border-gray-200"
                normalized={false}
              />
              <TableCellComponent
                value={totalWaste}
                normalizedValue={totalWaste}
                totalValue={totalWaste}
                normalizedTotalValue={totalWaste}
                className="border-r border-gray-400"
                normalized={false}
              />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 