import { Table, TableBody, TableRow, TableCell, TableHeader, TableHead } from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";

interface Client {
  name: string;
  hoursNeeded: number;
}

interface AllocationOpportunitiesTableProps {
  clients: Client[];
  sortConfig: { key: string; direction: "asc" | "desc" };
  onRequestSort: (key: string) => void;
}

export function AllocationOpportunitiesTable({
  clients,
  sortConfig,
  onRequestSort,
}: AllocationOpportunitiesTableProps) {
  const sortedClients = React.useMemo(() => {
    if (!sortConfig.key) return clients;

    return [...clients].sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      // For hoursNeeded
      const aValue = a.hoursNeeded;
      const bValue = b.hoursNeeded;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [clients, sortConfig]);

  const renderSortHeader = (key: string, label: string, className: string = "") => (
    <TableHead
      onClick={() => onRequestSort(key)}
      className={`text-right cursor-pointer hover:bg-gray-100 ${className}`}
    >
      {label}
      {sortConfig.key === key && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
    </TableHead>
  );

  return (
    <div className="mt-8">
      <SectionHeader title="Allocation Opportunities" subtitle="Clients needing additional hours" />
      <div className="px-2">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead className="border-r border-gray-400">Client</TableHead>
              {renderSortHeader("hoursNeeded", "Hours Needed", "w-[120px] border-r border-gray-400")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client, index) => (
              <TableRow key={client.name} className="h-[57px]">
                <TableCell className="text-right pr-4 text-gray-500 text-[10px]">
                  {index + 1}
                </TableCell>
                <TableCell className="border-r border-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right border-r border-gray-400">
                  {!isNaN(client.hoursNeeded) ? `${client.hoursNeeded.toFixed(1)}h` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 