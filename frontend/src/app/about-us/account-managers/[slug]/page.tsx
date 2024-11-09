"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ACCOUNT_MANAGER, AccountManager } from "./queries";
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
import { ClientSponsorCaseWorkerTable } from "./ClientSponsorCaseWorkerTable";
import { SponsorCaseWorkerTable } from "./SponsorCaseWorkerTable";
import { WorkerClientSponsorCaseTable } from "./WorkerClientSponsorCase";
import SectionHeader from "@/components/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const formatHours = (hours: number) => {
    return `${Math.round(hours * 10) / 10}h`;
  };

  const processClientData = (cases: AccountManager["timesheet"]["byCase"], hoursField: string) => {
    return cases
      .filter(c => Array.isArray(c.byWorker) && c.byWorker.some(w => w[hoursField] > 0))
      .reduce<Array<{
        name: string;
        totalHours: number;
        uniqueCases: number;
        uniqueSponsors: number;
        workers: Set<string>;
        sponsors: Set<string>;
        sponsorDetails: Map<string, {
          totalHours: number;
          cases: Array<{title: string; hours: number; workers: Array<{name: string; hours: number}>}>;
          workers: Set<string>;
        }>;
      }>>((acc, c) => {
        const totalCaseHours = Array.isArray(c.byWorker) ? c.byWorker.reduce((sum, w) => sum + (w[hoursField] || 0), 0) : 0;
        if (totalCaseHours === 0) return acc;

        const existingClient = acc.find(client => client.name === c.caseDetails.client.name);
        if (existingClient) {
          existingClient.totalHours += totalCaseHours;
          existingClient.uniqueCases += 1;
          
          c.byWorker
            .filter((w: { [key: string]: number } & { name: string }) => w[hoursField] > 0)
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
          
          c.byWorker
            .filter((w: { [key: string]: number }) => w[hoursField] > 0)
            .forEach((w: { name: string }) => sponsorData.workers.add(w.name));

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
          const workersWithHours = c.byWorker.filter((w: { [key: string]: number }) => w[hoursField] > 0);
          
          sponsorDetails.set(c.caseDetails.sponsor, {
            totalHours: totalCaseHours,
            workers: new Set(workersWithHours.map((w: { name: string }) => w.name)),
            cases: [{
              title: c.title,
              hours: totalCaseHours,
              workers: workersWithHours.map((w: { name: string }) => ({
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
            workers: new Set(workersWithHours.map((w: { name: string }) => w.name)),
            sponsorDetails
          });
        }
        return acc;
      }, []);
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
    }
  ];

  const selectedCategory = categories.find(cat => cat.title === selectedCard);
  const sortedClientData = selectedCategory?.clientData
    .filter(client => client.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours);

  return (
    <>
      <SectionHeader title="Timesheet Summary" subtitle="" />
      <div className="mb-4">
        <DatasetSelector
          selectedDataset={selectedDataset}
          onDatasetSelect={onDatasetSelect}
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
              }
            }}
            role={data?.totalHours > 0 ? "button" : "presentation"}
            tabIndex={data?.totalHours > 0 ? 0 : -1}
            onKeyDown={(e) => {
              if (data?.totalHours > 0 && (e.key === "Enter" || e.key === " ")) {
                setSelectedCard(selectedCard === title ? null : title);
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
          <Tabs defaultValue="client">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="client">By Client</TabsTrigger>
              <TabsTrigger value="sponsor">By Sponsor</TabsTrigger>
              <TabsTrigger value="worker">By Worker</TabsTrigger>
            </TabsList>
            <TabsContent value="client">
              <ClientSponsorCaseWorkerTable clientData={sortedClientData} />
            </TabsContent>
            <TabsContent value="sponsor">
              <SponsorCaseWorkerTable clientData={sortedClientData} />
            </TabsContent>
            <TabsContent value="worker">
              <WorkerClientSponsorCaseTable clientData={sortedClientData} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}

export default function AccountManagerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDataset, setSelectedDataset] = useState("timesheet-last-six-weeks");

  const { data, loading, error } = useQuery<{ accountManager: AccountManager }>(
    GET_ACCOUNT_MANAGER,
    {
      variables: { 
        slug,
        dataset: selectedDataset.replace('timesheet-', '')
      }
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
