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

interface WorkerClientSponsorCaseTableProps {
  clientData: ClientData[];
}

export function WorkerClientSponsorCaseTable({ clientData }: WorkerClientSponsorCaseTableProps) {
  const [expandedWorkers, setExpandedWorkers] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());

  const formatHours = (hours: number) => {
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours}h`;
  };

  // Processar dados para criar uma estrutura organizada por worker
  const processWorkerData = () => {
    const workerMap = new Map<string, {
      totalHours: number;
      clients: Map<string, {
        totalHours: number;
        sponsors: Map<string, {
          totalHours: number;
          cases: {
            title: string;
            hours: number;
          }[];
        }>;
      }>;
    }>();

    clientData.forEach(client => {
      client.sponsorDetails.forEach((sponsorData, sponsorName) => {
        sponsorData.cases.forEach(caseData => {
          caseData.workers.forEach(worker => {
            // Inicializar ou atualizar dados do worker
            const workerData = workerMap.get(worker.name) || {
              totalHours: 0,
              clients: new Map(),
            };
            workerData.totalHours += worker.hours;

            // Inicializar ou atualizar dados do cliente
            const clientData = workerData.clients.get(client.name) || {
              totalHours: 0,
              sponsors: new Map(),
            };
            clientData.totalHours += worker.hours;

            // Inicializar ou atualizar dados do sponsor
            const sponsorInfo = clientData.sponsors.get(sponsorName) || {
              totalHours: 0,
              cases: [],
            };
            sponsorInfo.totalHours += worker.hours;
            sponsorInfo.cases.push({
              title: caseData.title,
              hours: worker.hours,
            });

            clientData.sponsors.set(sponsorName, sponsorInfo);
            workerData.clients.set(client.name, clientData);
            workerMap.set(worker.name, workerData);
          });
        });
      });
    });

    return workerMap;
  };

  const workerData = processWorkerData();
  const sortedWorkers = Array.from(workerData.entries())
    .sort(([, a], [, b]) => b.totalHours - a.totalHours);

  const toggleWorker = (workerName: string) => {
    const newExpanded = new Set(expandedWorkers);
    if (newExpanded.has(workerName)) {
      newExpanded.delete(workerName);
    } else {
      newExpanded.add(workerName);
    }
    setExpandedWorkers(newExpanded);
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-4"></TableHead>
          <TableHead>Worker</TableHead>
          <TableHead className="text-right w-[100px]">Clients</TableHead>
          <TableHead className="text-right w-[100px]">Sponsors</TableHead>
          <TableHead className="text-right w-[100px]">Cases</TableHead>
          <TableHead className="text-right w-[100px]">Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedWorkers.map(([workerName, worker], index) => {
          const isWorkerExpanded = expandedWorkers.has(workerName);
          const rows = [];

          // Worker row
          rows.push(
            <TableRow
              key={workerName}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => toggleWorker(workerName)}
            >
              <TableCell className="w-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-4">#{index + 1}</span>
                  {isWorkerExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </TableCell>
              <TableCell className="font-medium">{workerName}</TableCell>
              <TableCell className="text-right">{worker.clients.size}</TableCell>
              <TableCell className="text-right">
                {Array.from(worker.clients.values()).reduce((acc, client) => acc + client.sponsors.size, 0)}
              </TableCell>
              <TableCell className="text-right">
                {Array.from(worker.clients.values()).reduce((acc, client) => 
                  acc + Array.from(client.sponsors.values()).reduce((sum, sponsor) => 
                    sum + sponsor.cases.length, 0), 0)}
              </TableCell>
              <TableCell className="text-right">{formatHours(worker.totalHours)}</TableCell>
            </TableRow>
          );

          if (isWorkerExpanded) {
            // Add client rows
            Array.from(worker.clients.entries())
              .sort(([, a], [, b]) => b.totalHours - a.totalHours)
              .forEach(([clientName, clientInfo]) => {
                const clientKey = `${workerName}-${clientName}`;
                const isClientExpanded = expandedClients.has(clientKey);

                rows.push(
                  <TableRow
                    key={clientKey}
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleClient(clientKey);
                    }}
                  >
                    <TableCell></TableCell>
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-1">
                        {isClientExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {clientName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">{clientInfo.sponsors.size}</TableCell>
                    <TableCell className="text-right">
                      {Array.from(clientInfo.sponsors.values()).reduce((sum, sponsor) => 
                        sum + sponsor.cases.length, 0)}
                    </TableCell>
                    <TableCell className="text-right">{formatHours(clientInfo.totalHours)}</TableCell>
                  </TableRow>
                );

                if (isClientExpanded) {
                  // Add sponsor rows
                  Array.from(clientInfo.sponsors.entries())
                    .sort(([, a], [, b]) => b.totalHours - a.totalHours)
                    .forEach(([sponsorName, sponsorInfo]) => {
                      const sponsorKey = `${clientKey}-${sponsorName}`;
                      const isSponsorExpanded = expandedSponsors.has(sponsorKey);

                      rows.push(
                        <TableRow
                          key={sponsorKey}
                          className="bg-gray-200 cursor-pointer hover:bg-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSponsor(sponsorKey);
                          }}
                        >
                          <TableCell></TableCell>
                          <TableCell className="pl-12">
                            <div className="flex items-center gap-1">
                              {isSponsorExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              {sponsorName}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">{sponsorInfo.cases.length}</TableCell>
                          <TableCell className="text-right">{formatHours(sponsorInfo.totalHours)}</TableCell>
                        </TableRow>
                      );

                      if (isSponsorExpanded) {
                        // Add case rows
                        sponsorInfo.cases
                          .sort((a, b) => b.hours - a.hours)
                          .forEach((caseInfo) => {
                            rows.push(
                              <TableRow
                                key={`${sponsorKey}-${caseInfo.title}`}
                                className="bg-gray-300"
                              >
                                <TableCell></TableCell>
                                <TableCell className="pl-16">{caseInfo.title}</TableCell>
                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right">{formatHours(caseInfo.hours)}</TableCell>
                              </TableRow>
                            );
                          });
                      }
                    });
                }
              });
          }

          return rows;
        })}
      </TableBody>
    </Table>
  );
} 