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

type Case = {
  title: string;
  hours: number;
};

type SponsorData = {
  totalHours: number;
  cases: Case[];
};

type ClientData = {
  name: string;
  uniqueSponsors: number;
  uniqueCases: number;
  totalHours: number;
  sponsors: Set<string>;
  sponsorDetails: Map<string, SponsorData>;
};

type AccountManagerData = {
  name: string;
  uniqueClients: number;
  uniqueSponsors: number;
  uniqueCases: number;
  totalHours: number;
  clientData: ClientData[];
};

type SortColumn = 'hours' | 'clients' | 'sponsors' | 'cases';

interface AccountManagerClientSponsorCaseTableProps {
  accountManagerData: AccountManagerData[];
}

export function AccountManagerClientSponsorCaseTable({ accountManagerData }: AccountManagerClientSponsorCaseTableProps) {
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>('hours');

  const formatHours = (hours: number) => {
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours}h`;
  };

  const toggleManager = (managerName: string) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerName)) {
      newExpanded.delete(managerName);
    } else {
      newExpanded.add(managerName);
    }
    setExpandedManagers(newExpanded);
  };

  const toggleClient = (clientKey: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientKey)) {
      newExpanded.delete(clientKey);
    } else {
      newExpanded.add(clientKey);
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

  const handleSort = (column: SortColumn) => {
    setSortColumn(column);
  };

  const sortedManagerData = [...accountManagerData].sort((a, b) => {
    switch (sortColumn) {
      case 'hours':
        return b.totalHours - a.totalHours;
      case 'clients':
        return b.uniqueClients - a.uniqueClients;
      case 'sponsors':
        return b.uniqueSponsors - a.uniqueSponsors;
      case 'cases':
        return b.uniqueCases - a.uniqueCases;
      default:
        return 0;
    }
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-4"></TableHead>
          <TableHead>Account Manager</TableHead>
          <TableHead 
            className="text-right w-[100px] cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('clients')}
          >
            Clients {sortColumn === 'clients' && '↓'}
          </TableHead>
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
          <TableHead 
            className="text-right w-[100px] cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('hours')}
          >
            Hours {sortColumn === 'hours' && '↓'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedManagerData.map((manager, index) => {
          const isManagerExpanded = expandedManagers.has(manager.name);

          return (
            <>
              <TableRow 
                key={manager.name}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => toggleManager(manager.name)}
              >
                <TableCell className="w-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-4">#{index + 1}</span>
                    {isManagerExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{manager.name}</TableCell>
                <TableCell className="text-right w-[100px]">{manager.uniqueClients}</TableCell>
                <TableCell className="text-right w-[100px]">{manager.uniqueSponsors}</TableCell>
                <TableCell className="text-right w-[100px]">{manager.uniqueCases}</TableCell>
                <TableCell className="text-right w-[100px]">{formatHours(manager.totalHours)}</TableCell>
              </TableRow>

              {isManagerExpanded && manager.clientData
                .sort((a, b) => b.totalHours - a.totalHours)
                .map(client => {
                  const clientKey = `${manager.name}-${client.name}`;
                  const isClientExpanded = expandedClients.has(clientKey);

                  return (
                    <>
                      <TableRow 
                        key={clientKey}
                        className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClient(clientKey);
                        }}
                      >
                        <TableCell className="w-4"></TableCell>
                        <TableCell className="pl-8">
                          <div className="flex items-center gap-1">
                            {isClientExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <span>{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right w-[100px]">-</TableCell>
                        <TableCell className="text-right w-[100px]">{client.uniqueSponsors}</TableCell>
                        <TableCell className="text-right w-[100px]">{client.uniqueCases}</TableCell>
                        <TableCell className="text-right w-[100px]">{formatHours(client.totalHours)}</TableCell>
                      </TableRow>

                      {isClientExpanded && Array.from(client.sponsorDetails.entries())
                        .sort(([,a], [,b]) => b.totalHours - a.totalHours)
                        .map(([sponsor, data]) => {
                          const sponsorKey = `${clientKey}-${sponsor}`;
                          const isSponsorExpanded = expandedSponsors.has(sponsorKey);

                          return (
                            <>
                              <TableRow 
                                key={sponsorKey}
                                className="bg-gray-200 cursor-pointer hover:bg-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSponsor(sponsorKey);
                                }}
                              >
                                <TableCell className="w-4"></TableCell>
                                <TableCell className="pl-12">
                                  <div className="flex items-center gap-1">
                                    {isSponsorExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    <span>{sponsor}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right w-[100px]">-</TableCell>
                                <TableCell className="text-right w-[100px]">-</TableCell>
                                <TableCell className="text-right w-[100px]">{data.cases.length}</TableCell>
                                <TableCell className="text-right w-[100px]">{formatHours(data.totalHours)}</TableCell>
                              </TableRow>

                              {isSponsorExpanded && data.cases
                                .sort((a, b) => b.hours - a.hours)
                                .map(caseData => (
                                  <TableRow 
                                    key={`${sponsorKey}-${caseData.title}`}
                                    className="bg-gray-300"
                                  >
                                    <TableCell className="w-4"></TableCell>
                                    <TableCell className="pl-16">{caseData.title}</TableCell>
                                    <TableCell className="text-right w-[100px]">-</TableCell>
                                    <TableCell className="text-right w-[100px]">-</TableCell>
                                    <TableCell className="text-right w-[100px]">-</TableCell>
                                    <TableCell className="text-right w-[100px]">{formatHours(caseData.hours)}</TableCell>
                                  </TableRow>
                                ))}
                            </>
                          );
                        })}
                    </>
                  );
                })}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}
