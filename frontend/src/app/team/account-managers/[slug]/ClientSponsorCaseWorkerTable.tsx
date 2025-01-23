import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type Worker = {
  name: string;
  hours: number;
};

type Case = {
  title: string;
  hours: number;
  workers: Worker[];
};

type SponsorData = {
  totalHours: number;
  workers: Set<string>;
  cases: Case[];
};

type ClientData = {
  name: string;
  uniqueSponsors: number;
  uniqueCases: number;
  totalHours: number;
  sponsors: Set<string>;
  workers: Set<string>;
  sponsorDetails: Map<string, SponsorData>;
};

type SortColumn = 'hours' | 'sponsors' | 'cases' | 'workers';

interface ClientSponsorCaseWorkerTableProps {
  clientData: ClientData[];
  showWorkersInfo?: boolean;
}

export function ClientSponsorCaseWorkerTable({ clientData, showWorkersInfo = true }: ClientSponsorCaseWorkerTableProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>('hours');

  const formatHours = (hours: number) => {
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours}h`;
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
      expandedSponsors.forEach(sponsorKey => {
        if (sponsorKey.startsWith(`${clientName}-`)) {
          expandedSponsors.delete(sponsorKey);
        }
      });
      setExpandedSponsors(new Set(expandedSponsors));
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const toggleSponsor = (sponsorKey: string) => {
    const newExpanded = new Set(expandedSponsors);
    if (newExpanded.has(sponsorKey)) {
      newExpanded.delete(sponsorKey);
    } else {
      newExpanded.add(sponsorKey);
    }
    setExpandedSponsors(newExpanded);
  };

  const toggleCase = (caseKey: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseKey)) {
      newExpanded.delete(caseKey);
    } else {
      newExpanded.add(caseKey);
    }
    setExpandedCases(newExpanded);
  };

  const handleSort = (column: SortColumn) => {
    setSortColumn(column);
  };

  const sortedClientData = [...clientData].sort((a, b) => {
    switch (sortColumn) {
      case 'hours':
        return b.totalHours - a.totalHours;
      case 'sponsors':
        return b.uniqueSponsors - a.uniqueSponsors;
      case 'cases':
        return b.uniqueCases - a.uniqueCases;
      case 'workers':
        return showWorkersInfo ? b.workers.size - a.workers.size : 0;
      default:
        return 0;
    }
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-4"></TableHead>
          <TableHead>Client</TableHead>
          <TableHead 
            className="text-right w-[100px] cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('sponsors')}
          >
            Sponsors {sortColumn === 'sponsors' && '↓'}
          </TableHead>
          <TableHead 
            className="text-right w-[100px] cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('cases')}
          >
            Cases {sortColumn === 'cases' && '↓'}
          </TableHead>
          {showWorkersInfo && (
            <TableHead 
              className="text-right w-[100px] cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('workers')}
            >
              Workers {sortColumn === 'workers' && '↓'}
            </TableHead>
          )}
          <TableHead 
            className="text-right w-[100px] cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('hours')}
          >
            Hours {sortColumn === 'hours' && '↓'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedClientData.map((client, index) => {
          const isClientExpanded = expandedClients.has(client.name);
          const rows = [];

          rows.push(
            <TableRow 
              key={client.name}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => toggleClient(client.name)}
            >
              <TableCell className="w-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-4">#{index + 1}</span>
                  {isClientExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </TableCell>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell className="text-right w-[100px]">{client.uniqueSponsors}</TableCell>
              <TableCell className="text-right w-[100px]">{client.uniqueCases}</TableCell>
              {showWorkersInfo && (
                <TableCell className="text-right w-[100px]">{client.workers.size}</TableCell>
              )}
              <TableCell className="text-right w-[100px]">{formatHours(client.totalHours)}</TableCell>
            </TableRow>
          );

          if (isClientExpanded) {
            Array.from(client.sponsorDetails.entries())
              .sort(([,a], [,b]) => b.totalHours - a.totalHours)
              .forEach(([sponsor, data]) => {
                const sponsorKey = `${client.name}-${sponsor}`;
                const isSponsorExpanded = expandedSponsors.has(sponsorKey);

                rows.push(
                  <TableRow 
                    key={sponsorKey}
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSponsor(sponsorKey);
                    }}
                  >
                    <TableCell className="w-4"></TableCell>
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-1">
                        {isSponsorExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span>{sponsor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right w-[100px]">-</TableCell>
                    <TableCell className="text-right w-[100px]">{data.cases.length}</TableCell>
                    {showWorkersInfo && (
                      <TableCell className="text-right w-[100px]">{data.workers.size}</TableCell>
                    )}
                    <TableCell className="text-right w-[100px]">{formatHours(data.totalHours)}</TableCell>
                  </TableRow>
                );

                if (isSponsorExpanded) {
                  data.cases
                    .sort((a, b) => b.hours - a.hours)
                    .forEach((caseData) => {
                      const caseKey = `${sponsorKey}-${caseData.title}`;
                      const isCaseExpanded = expandedCases.has(caseKey);

                      rows.push(
                        <TableRow 
                          key={caseKey}
                          className={`bg-gray-200 ${showWorkersInfo ? 'cursor-pointer hover:bg-gray-300' : ''}`}
                          onClick={(e) => {
                            if (showWorkersInfo) {
                              e.stopPropagation();
                              toggleCase(caseKey);
                            }
                          }}
                        >
                          <TableCell className="w-4"></TableCell>
                          <TableCell className="pl-12">
                            <div className="flex items-center gap-1">
                              {showWorkersInfo && (isCaseExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                              <span>{caseData.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right w-[100px]">-</TableCell>
                          <TableCell className="text-right w-[100px]">-</TableCell>
                          {showWorkersInfo && (
                            <TableCell className="text-right w-[100px]">{caseData.workers.length}</TableCell>
                          )}
                          <TableCell className="text-right w-[100px]">{formatHours(caseData.hours)}</TableCell>
                        </TableRow>
                      );

                      if (showWorkersInfo && isCaseExpanded) {
                        caseData.workers
                          .sort((a, b) => b.hours - a.hours)
                          .forEach((worker) => {
                            rows.push(
                              <TableRow 
                                key={`${caseKey}-${worker.name}`}
                                className="bg-gray-300"
                              >
                                <TableCell className="w-4"></TableCell>
                                <TableCell className="pl-16">{worker.name}</TableCell>
                                <TableCell className="text-right w-[100px]">-</TableCell>
                                <TableCell className="text-right w-[100px]">-</TableCell>
                                {showWorkersInfo && (
                                  <TableCell className="text-right w-[100px]">-</TableCell>
                                )}
                                <TableCell className="text-right w-[100px]">{formatHours(worker.hours)}</TableCell>
                              </TableRow>
                            );
                          });
                      }
                    });
                }
              });
          }

          return rows;
        }).flat()}
      </TableBody>
    </Table>
  );
} 