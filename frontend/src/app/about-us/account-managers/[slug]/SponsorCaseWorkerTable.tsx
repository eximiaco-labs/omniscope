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

type ClientData = {
  name: string;
  uniqueSponsors: number;
  uniqueCases: number;
  totalHours: number;
  sponsors: Set<string>;
  workers: Set<string>;
  sponsorDetails: Map<string, {
    totalHours: number;
    workers: Set<string>;
    cases: Case[];
  }>;
};

type SortColumn = 'hours' | 'cases' | 'workers';

interface SponsorCaseWorkerTableProps {
  clientData: ClientData[];
  showWorkersInfo?: boolean;
}

export function SponsorCaseWorkerTable({ clientData, showWorkersInfo = true }: SponsorCaseWorkerTableProps) {
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>('hours');

  const formatHours = (hours: number) => {
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours}h`;
  };

  // Agrupa todos os dados por sponsor
  const sponsorData = clientData.reduce((acc, client) => {
    Array.from(client.sponsorDetails.entries()).forEach(([sponsorName, data]) => {
      const existingSponsor = acc.find(s => s.name === sponsorName);
      if (existingSponsor) {
        existingSponsor.totalHours += data.totalHours;
        existingSponsor.clients.add(client.name);
        existingSponsor.workers = new Set(Array.from(existingSponsor.workers).concat(Array.from(data.workers)));
        existingSponsor.cases.push(...data.cases.map(c => ({
          ...c,
          clientName: client.name
        })));
      } else {
        acc.push({
          name: sponsorName,
          totalHours: data.totalHours,
          clients: new Set([client.name]),
          workers: data.workers,
          cases: data.cases.map(c => ({
            ...c,
            clientName: client.name
          }))
        });
      }
    });
    return acc;
  }, [] as Array<{
    name: string;
    totalHours: number;
    clients: Set<string>;
    workers: Set<string>;
    cases: Array<Case & { clientName: string }>;
  }>).sort((a, b) => {
    switch (sortColumn) {
      case 'hours':
        return b.totalHours - a.totalHours;
      case 'cases':
        return b.cases.length - a.cases.length;
      case 'workers':
        return showWorkersInfo ? b.workers.size - a.workers.size : 0;
      default:
        return 0;
    }
  });

  const toggleSponsor = (sponsorName: string) => {
    const newExpanded = new Set(expandedSponsors);
    if (newExpanded.has(sponsorName)) {
      newExpanded.delete(sponsorName);
    } else {
      newExpanded.add(sponsorName);
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-4"></TableHead>
          <TableHead>Sponsor</TableHead>
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
        {sponsorData.map((sponsor, index) => {
          const isSponsorExpanded = expandedSponsors.has(sponsor.name);
          const rows = [];

          rows.push(
            <TableRow 
              key={sponsor.name}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => toggleSponsor(sponsor.name)}
            >
              <TableCell className="w-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-4">#{index + 1}</span>
                  {isSponsorExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {sponsor.name} ({Array.from(sponsor.clients).join(", ")})
              </TableCell>
              <TableCell className="text-right w-[100px]">{sponsor.cases.length}</TableCell>
              {showWorkersInfo && (
                <TableCell className="text-right w-[100px]">{sponsor.workers.size}</TableCell>
              )}
              <TableCell className="text-right w-[100px]">{formatHours(sponsor.totalHours)}</TableCell>
            </TableRow>
          );

          if (isSponsorExpanded) {
            sponsor.cases
              .sort((a, b) => b.hours - a.hours)
              .forEach((caseData) => {
                const caseKey = `${sponsor.name}-${caseData.title}`;
                const isCaseExpanded = expandedCases.has(caseKey);

                rows.push(
                  <TableRow 
                    key={caseKey}
                    className={`bg-gray-100 ${showWorkersInfo ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                    onClick={(e) => {
                      if (showWorkersInfo) {
                        e.stopPropagation();
                        toggleCase(caseKey);
                      }
                    }}
                  >
                    <TableCell className="w-4"></TableCell>
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-1">
                        {showWorkersInfo && (isCaseExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                        <span>{caseData.title}</span>
                      </div>
                    </TableCell>
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
                          className="bg-gray-200"
                        >
                          <TableCell className="w-4"></TableCell>
                          <TableCell className="pl-12">{worker.name}</TableCell>
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

          return rows;
        }).flat()}
      </TableBody>
    </Table>
  );
} 