"use client";

import { useState } from "react";
import { STAT_COLORS } from "@/app/constants/colors";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";
import { ClientSponsorCaseWorkerTable } from "./ClientSponsorCaseWorkerTable";
import { SponsorCaseWorkerTable } from "./SponsorCaseWorkerTable";
import { WorkerClientSponsorCaseTable } from "./WorkerClientSponsorCase";
import { AccountManagerClientSponsorCaseTable } from "./AccountManagerClientSponsorCaseTable";
import SectionHeader from "@/components/SectionHeader";
import { AccountManager } from "./queries";

interface TimesheetSummaryProps {
  timesheet: AccountManager["timesheet"];
  selectedDataset: string;
  onDatasetSelect: (dataset: string) => void;
  showWorkersInfo?: boolean;
}

interface Worker {
  name: string;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
  [key: string]: string | number;
}

interface CategoryCardProps {
  title: string;
  color: string;
  data: any;
  selectedCard: string | null;
  showWorkersInfo: boolean;
  onCardClick: (title: string) => void;
  totalHours: number;
}

const CategoryCard = ({ title, color, data, selectedCard, showWorkersInfo, onCardClick, totalHours }: CategoryCardProps) => {
  const formatHours = (hours: number) => {
    return `${Math.round(hours * 10) / 10}h`;
  };

  const numericValue = data?.totalHours || 0;
  const percentage = totalHours > 0 ? ((numericValue / totalHours) * 100).toFixed(1) : null;

  return (
    <div
      className={`p-6 text-white border border-gray-200 rounded-sm relative transition-all duration-200 h-[120px] ${
        numericValue === 0 ? "opacity-50" : "cursor-pointer"
      } ${
        selectedCard === title && numericValue > 0
          ? "ring-2 ring-offset-2 ring-black scale-105"
          : numericValue > 0
          ? "hover:scale-102"
          : ""
      }`}
      style={{ backgroundColor: color }}
      onClick={() => {
        if (numericValue > 0) {
          onCardClick(title);
        }
      }}
      role={numericValue > 0 ? "button" : "presentation"}
      tabIndex={numericValue > 0 ? 0 : -1}
      onKeyDown={(e) => {
        if (numericValue > 0 && (e.key === "Enter" || e.key === " ")) {
          onCardClick(title);
        }
      }}
    >
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <div className="mt-1 text-3xl font-semibold">
        {formatHours(numericValue)}
      </div>
      <div className="absolute top-6 right-2 text-[10px] opacity-90">
        <ul className="list-none text-right">
          {data?.uniqueClients > 0 && (
            <li>{data.uniqueClients} client{data.uniqueClients !== 1 ? "s" : ""}</li>
          )}
          {data?.uniqueSponsors > 0 && (
            <li>{data.uniqueSponsors} sponsor{data.uniqueSponsors !== 1 ? "s" : ""}</li>
          )}
          {data?.uniqueCases > 0 && (
            <li>{data.uniqueCases} case{data.uniqueCases !== 1 ? "s" : ""}</li>
          )}
          {showWorkersInfo && data?.uniqueWorkers > 0 && (
            <li>{data.uniqueWorkers} worker{data.uniqueWorkers !== 1 ? "s" : ""}</li>
          )}
        </ul>
      </div>
      {percentage && (
        <div className="absolute bottom-2 right-2 text-xs opacity-90">
          {`${percentage}%`}
        </div>
      )}
    </div>
  );
};

export function TimesheetSummary({
  timesheet,
  selectedDataset,
  onDatasetSelect,
  showWorkersInfo = true,
}: TimesheetSummaryProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const formatHours = (hours: number) => {
    return `${Math.round(hours * 10) / 10}h`;
  };

  const processAccountManagerData = (
    cases: AccountManager["timesheet"]["byCase"],
    hoursField: string
  ) => {
    return cases
      .filter(
        (c) =>
          Array.isArray(c.byWorker) &&
          c.byWorker.some((w) => Number((w as Worker)[hoursField]) > 0)
      )
      .reduce<
        Array<{
          name: string;
          totalHours: number;
          uniqueClients: number;
          uniqueCases: number;
          uniqueSponsors: number;
          clientData: Array<{
            name: string;
            totalHours: number;
            uniqueCases: number;
            uniqueSponsors: number;
            workers: Set<string>;
            sponsors: Set<string>;
            sponsorDetails: Map<
              string,
              {
                totalHours: number;
                cases: Array<{
                  title: string;
                  hours: number;
                  workers: Array<{ name: string; hours: number }>;
                }>;
                workers: Set<string>;
              }
            >;
          }>;
        }>
      >((acc, c) => {
        const totalCaseHours = Array.isArray(c.byWorker)
          ? c.byWorker.reduce(
              (sum, w) => sum + Number((w as Worker)[hoursField] || 0),
              0
            )
          : 0;

        if (totalCaseHours === 0) return acc;

        const accountManagerName = c.caseDetails?.client?.accountManager?.name || "Unknown";
        const existingManager = acc.find(
          (manager) => manager.name === accountManagerName
        );

        if (existingManager) {
          existingManager.totalHours += totalCaseHours;
          existingManager.uniqueCases += 1;
          
          // Update client data
          const existingClient = existingManager.clientData.find(
            client => client.name === c.caseDetails.client.name
          );

          if (existingClient) {
            existingClient.totalHours += totalCaseHours;
            existingClient.uniqueCases += 1;
            existingClient.sponsors.add(c.caseDetails.sponsor);
            c.byWorker.forEach(w => existingClient.workers.add(w.name));
          } else {
            existingManager.uniqueClients += 1;
            existingManager.clientData.push({
              name: c.caseDetails.client.name,
              totalHours: totalCaseHours,
              uniqueCases: 1,
              uniqueSponsors: 1,
              workers: new Set(c.byWorker.map(w => w.name)),
              sponsors: new Set([c.caseDetails.sponsor]),
              sponsorDetails: new Map()
            });
          }
        } else {
          acc.push({
            name: accountManagerName,
            totalHours: totalCaseHours,
            uniqueClients: 1,
            uniqueCases: 1,
            uniqueSponsors: 1,
            clientData: [{
              name: c.caseDetails.client.name,
              totalHours: totalCaseHours,
              uniqueCases: 1,
              uniqueSponsors: 1,
              workers: new Set(c.byWorker.map(w => w.name)),
              sponsors: new Set([c.caseDetails.sponsor]),
              sponsorDetails: new Map()
            }]
          });
        }

        return acc;
      }, [])
      .sort((a, b) => b.totalHours - a.totalHours);
  };

  const processClientData = (
    cases: AccountManager["timesheet"]["byCase"],
    hoursField: string
  ) => {
    return cases
      .filter(
        (c) =>
          Array.isArray(c.byWorker) &&
          c.byWorker.some((w) => Number((w as Worker)[hoursField]) > 0)
      )
      .reduce<
        Array<{
          name: string;
          totalHours: number;
          uniqueCases: number;
          uniqueSponsors: number;
          workers: Set<string>;
          sponsors: Set<string>;
          sponsorDetails: Map<
            string,
            {
              totalHours: number;
              cases: Array<{
                title: string;
                hours: number;
                workers: Array<{ name: string; hours: number }>;
              }>;
              workers: Set<string>;
            }
          >;
        }>
      >((acc, c) => {
        const totalCaseHours = Array.isArray(c.byWorker)
          ? c.byWorker.reduce(
              (sum, w) => sum + Number((w as Worker)[hoursField] || 0),
              0
            )
          : 0;

        if (totalCaseHours === 0) return acc;

        const existingClient = acc.find(
          (client) => client.name === c.caseDetails.client.name
        );
        if (existingClient) {
          existingClient.totalHours += totalCaseHours;
          existingClient.uniqueCases += 1;
          if (showWorkersInfo) {
            c.byWorker
              .filter((w) => Number((w as Worker)[hoursField]) > 0)
              .forEach((w) => existingClient.workers.add(w.name));
          }

          if (!existingClient.sponsors.has(c.caseDetails.sponsor)) {
            existingClient.sponsors.add(c.caseDetails.sponsor);
            existingClient.uniqueSponsors += 1;
          }

          const sponsorData = existingClient.sponsorDetails.get(
            c.caseDetails.sponsor
          ) || {
            totalHours: 0,
            cases: [],
            workers: new Set(),
          };
          sponsorData.totalHours += totalCaseHours;

          if (showWorkersInfo) {
            c.byWorker
              .filter((w) => Number((w as Worker)[hoursField]) > 0)
              .forEach((w) => sponsorData.workers.add(w.name));
          }

          sponsorData.cases.push({
            title: c.title,
            hours: totalCaseHours,
            workers: showWorkersInfo ? c.byWorker
              .filter((w) => Number((w as Worker)[hoursField]) > 0)
              .map((w) => ({
                name: w.name,
                hours: Number((w as Worker)[hoursField] || 0),
              })) : [],
          });
          existingClient.sponsorDetails.set(c.caseDetails.sponsor, sponsorData);
        } else {
          const sponsorDetails = new Map();
          const workersWithHours = c.byWorker.filter(
            (w) => Number((w as Worker)[hoursField]) > 0
          );

          sponsorDetails.set(c.caseDetails.sponsor, {
            totalHours: totalCaseHours,
            workers: showWorkersInfo ? new Set(workersWithHours.map((w) => w.name)) : new Set(),
            cases: [
              {
                title: c.title,
                hours: totalCaseHours,
                workers: showWorkersInfo ? workersWithHours.map((w) => ({
                  name: w.name,
                  hours: (w as Worker)[hoursField] || 0,
                })) : [],
              },
            ],
          });

          acc.push({
            name: c.caseDetails.client.name,
            uniqueSponsors: 1,
            uniqueCases: 1,
            totalHours: totalCaseHours,
            sponsors: new Set([c.caseDetails.sponsor]),
            workers: showWorkersInfo ? new Set(workersWithHours.map((w) => w.name)) : new Set(),
            sponsorDetails,
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
      clientData: processClientData(timesheet.byCase, "totalConsultingHours"),
    },
    {
      title: "Hands On",
      color: STAT_COLORS.handsOn,
      data: timesheet.byKind.handsOn,
      clientData: processClientData(timesheet.byCase, "totalHandsOnHours"),
    },
    {
      title: "Squad",
      color: STAT_COLORS.squad,
      data: timesheet.byKind.squad,
      clientData: processClientData(timesheet.byCase, "totalSquadHours"),
    },
    {
      title: "Internal",
      color: STAT_COLORS.internal,
      data: timesheet.byKind.internal,
      clientData: processClientData(timesheet.byCase, "totalInternalHours"),
    },
  ];

  const totalHours = categories.reduce((sum, category) => sum + (category.data?.totalHours || 0), 0);

  const selectedCategory = categories.find((cat) => cat.title === selectedCard);
  const sortedClientData = selectedCategory?.clientData
    .filter((client) => client.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="mb-4">
      <SectionHeader title="Timesheet Summary" subtitle="" />
      <div className="mr-2 ml-2">
        <div className="mb-2">
          <DatasetSelector
            selectedDataset={selectedDataset}
            onDatasetSelect={onDatasetSelect}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(({ title, color, data }) => (
            <CategoryCard
              key={title}
              title={title}
              color={color}
              data={data}
              selectedCard={selectedCard}
              showWorkersInfo={showWorkersInfo}
              onCardClick={(title) => setSelectedCard(selectedCard === title ? null : title)}
              totalHours={totalHours}
            />
          ))}
        </div>

        {selectedCard && sortedClientData && (
          <div className="mt-4">
            <Tabs defaultValue="client">
              <TabsList className="w-full justify-start">
                {!showWorkersInfo && <TabsTrigger value="manager">By Account Manager</TabsTrigger>}
                <TabsTrigger value="client">By Client</TabsTrigger>
                <TabsTrigger value="sponsor">By Sponsor</TabsTrigger>
                {showWorkersInfo && <TabsTrigger value="worker">By Worker</TabsTrigger>}
              </TabsList>
              {!showWorkersInfo && (
                <TabsContent value="manager">
                  <AccountManagerClientSponsorCaseTable 
                    accountManagerData={processAccountManagerData(timesheet.byCase, "totalConsultingHours")}
                  />
                </TabsContent>
              )}
              <TabsContent value="client">
                <ClientSponsorCaseWorkerTable 
                  clientData={sortedClientData} 
                  showWorkersInfo={showWorkersInfo}
                />
              </TabsContent>
              <TabsContent value="sponsor">
                <SponsorCaseWorkerTable 
                  clientData={sortedClientData}
                  showWorkersInfo={showWorkersInfo}
                />
              </TabsContent>
              {showWorkersInfo && (
                <TabsContent value="worker">
                  <WorkerClientSponsorCaseTable clientData={sortedClientData} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
