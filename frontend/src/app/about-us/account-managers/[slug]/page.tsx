"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ACCOUNT_MANAGER, AccountManager } from "./queries";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { STAT_COLORS } from "@/app/constants/colors";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

function TimesheetSummarySection({
  timesheet,
  selectedDataset,
  onDatasetSelect,
}: {
  timesheet: AccountManager["timesheet"];
  selectedDataset: string;
  onDatasetSelect: (dataset: string) => void;
}) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());

  const formatHours = (hours: number) => {
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours}h`;
  };

  const processClientData = (cases: AccountManager["timesheet"]["byCase"], hoursField: keyof AccountManager["timesheet"]["byCase"][0]["byWorker"]) => {
    return cases
      .filter(c => c.byWorker.some(w => w[hoursField] > 0))
      .reduce((acc, c) => {
        const totalCaseHours = c.byWorker.reduce((sum, w) => sum + (w[hoursField] || 0), 0);
        if (totalCaseHours === 0) return acc;

        const existingClient = acc.find(client => client.name === c.caseDetails.client.name);
        if (existingClient) {
          existingClient.totalHours += totalCaseHours;
          existingClient.uniqueCases += 1;
          
          // Add workers with hours > 0 to the client's worker set
          c.byWorker
            .filter(w => w[hoursField] > 0)
            .forEach(w => existingClient.workers.add(w.name));

          if (!existingClient.sponsors.has(c.caseDetails.sponsor)) {
            existingClient.sponsors.add(c.caseDetails.sponsor);
            existingClient.uniqueSponsors += 1;
          }
          
          const sponsorData = existingClient.sponsorDetails.get(c.caseDetails.sponsor) || {
            totalHours: 0,
            cases: [],
            workers: new Set()
          };
          sponsorData.totalHours += totalCaseHours;
          
          // Add workers with hours > 0 to the sponsor's worker set
          c.byWorker
            .filter(w => w[hoursField] > 0)
            .forEach(w => sponsorData.workers.add(w.name));

          sponsorData.cases.push({
            title: c.title,
            hours: totalCaseHours,
            workers: c.byWorker
              .filter(w => w[hoursField] > 0)
              .map(w => ({
                name: w.name,
                hours: w[hoursField] || 0
              }))
          });
          existingClient.sponsorDetails.set(c.caseDetails.sponsor, sponsorData);
        } else {
          const sponsorDetails = new Map();
          const workersWithHours = c.byWorker.filter(w => w[hoursField] > 0);
          
          sponsorDetails.set(c.caseDetails.sponsor, {
            totalHours: totalCaseHours,
            workers: new Set(workersWithHours.map(w => w.name)),
            cases: [{
              title: c.title,
              hours: totalCaseHours,
              workers: workersWithHours.map(w => ({
                name: w.name,
                hours: w[hoursField] || 0
              }))
            }]
          });
          
          acc.push({
            name: c.caseDetails.client.name,
            uniqueSponsors: 1,
            uniqueCases: 1,
            totalHours: totalCaseHours,
            sponsors: new Set([c.caseDetails.sponsor]),
            workers: new Set(workersWithHours.map(w => w.name)),
            sponsorDetails
          });
        }
        return acc;
      }, [] as Array<{
        name: string;
        uniqueSponsors: number;
        uniqueCases: number;
        totalHours: number;
        sponsors: Set<string>;
        workers: Set<string>;
        sponsorDetails: Map<string, {
          totalHours: number;
          workers: Set<string>;
          cases: Array<{
            title: string;
            hours: number;
            workers: Array<{
              name: string;
              hours: number;
            }>;
          }>;
        }>;
      }>);
  };

  const categories = [
    {
      title: "Consulting",
      color: STAT_COLORS.consulting,
      data: timesheet.byKind.consulting,
      clientData: processClientData(timesheet.byCase, 'totalConsultingHours')
    },
    {
      title: "Hands On",
      color: STAT_COLORS.handsOn,
      data: timesheet.byKind.handsOn,
      clientData: processClientData(timesheet.byCase, 'totalHandsOnHours')
    },
    {
      title: "Squad",
      color: STAT_COLORS.squad,
      data: timesheet.byKind.squad,
      clientData: processClientData(timesheet.byCase, 'totalSquadHours')
    },
    {
      title: "Internal",
      color: STAT_COLORS.internal,
      data: timesheet.byKind.internal,
      clientData: processClientData(timesheet.byCase, 'totalInternalHours')
    },
  ];

  const handleDatasetSelect = (value: string) => {
    onDatasetSelect(value);
  };

  const selectedCategory = categories.find(cat => cat.title === selectedCard);
  const sortedClientData = selectedCategory?.clientData
    .filter(client => client.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours);

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

  return (
    <>
      <div className="mb-4">
        <DatasetSelector
          selectedDataset={selectedDataset}
          onDatasetSelect={handleDatasetSelect}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(({ title, color, data }) => (
          <Card
            key={title}
            className={`text-white transition-all duration-200 h-[140px] ${
              data?.totalHours === 0 ? "opacity-50" : "cursor-pointer"
            } ${
              selectedCard === title && data?.totalHours > 0
                ? "ring-2 ring-offset-2 ring-black scale-105"
                : data?.totalHours > 0
                ? "hover:scale-102"
                : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => {
              if (data?.totalHours > 0) {
                setSelectedCard(selectedCard === title ? null : title);
                setExpandedClients(new Set());
                setExpandedSponsors(new Set());
                setExpandedCases(new Set());
              }
            }}
            role={data?.totalHours > 0 ? "button" : "presentation"}
            tabIndex={data?.totalHours > 0 ? 0 : -1}
            onKeyDown={(e) => {
              if (data?.totalHours > 0 && (e.key === "Enter" || e.key === " ")) {
                setSelectedCard(selectedCard === title ? null : title);
                setExpandedClients(new Set());
                setExpandedSponsors(new Set());
                setExpandedCases(new Set());
              }
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-3xl font-bold">{formatHours(data?.totalHours || 0)}</div>
            </CardContent>
            <CardFooter>
              <div className="text-[10px] text-left">
                <div className="font-medium">
                  {data?.uniqueClients} client{data?.uniqueClients !== 1 ? "s" : ""}{" "}
                  • {data?.uniqueSponsors} sponsor
                  {data?.uniqueSponsors !== 1 ? "s" : ""} • {data?.uniqueCases} case
                  {data?.uniqueCases !== 1 ? "s" : ""} • {data?.uniqueWorkers}{" "}
                  worker{data?.uniqueWorkers !== 1 ? "s" : ""}
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedCard && sortedClientData && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-4"></TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right w-[100px]">Sponsors</TableHead>
                <TableHead className="text-right w-[100px]">Cases</TableHead>
                <TableHead className="text-right w-[100px]">Workers</TableHead>
                <TableHead className="text-right w-[100px]">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClientData.map((client) => {
                const isClientExpanded = expandedClients.has(client.name);
                const rows = [];

                rows.push(
                  <TableRow 
                    key={client.name}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleClient(client.name)}
                  >
                    <TableCell className="w-4">
                      {isClientExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-right w-[100px]">{client.uniqueSponsors}</TableCell>
                    <TableCell className="text-right w-[100px]">{client.uniqueCases}</TableCell>
                    <TableCell className="text-right w-[100px]">{client.workers.size}</TableCell>
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
                          <TableCell className="text-right w-[100px]">{data.workers.size}</TableCell>
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
                                className="bg-gray-200 cursor-pointer hover:bg-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCase(caseKey);
                                }}
                              >
                                <TableCell className="w-4"></TableCell>
                                <TableCell className="pl-12">
                                  <div className="flex items-center gap-1">
                                    {isCaseExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    <span>{caseData.title}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right w-[100px]">-</TableCell>
                                <TableCell className="text-right w-[100px]">-</TableCell>
                                <TableCell className="text-right w-[100px]">{caseData.workers.length}</TableCell>
                                <TableCell className="text-right w-[100px]">{formatHours(caseData.hours)}</TableCell>
                              </TableRow>
                            );

                            if (isCaseExpanded) {
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
                                      <TableCell className="text-right w-[100px]">-</TableCell>
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
        </div>
      )}
    </>
  );
}

export default function AccountManagerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDataset, setSelectedDataset] = useState<string>("timesheet-last-six-weeks");

  const { data, loading, error } = useQuery<{ accountManager: AccountManager }>(
    GET_ACCOUNT_MANAGER,
    {
      variables: { 
        slug,
        dataset: selectedDataset.replace('timesheet-', '')
      },
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.accountManager) return <div>Manager not found</div>;

  const { name, position, photoUrl } = data.accountManager;

  return (
    <div className="w-full p-2">
      <header className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600">{position}</p>
        </div>
      </header>

      <TimesheetSummarySection 
        timesheet={data.accountManager.timesheet} 
        selectedDataset={selectedDataset}
        onDatasetSelect={setSelectedDataset}
      />
    </div>
  );
}
