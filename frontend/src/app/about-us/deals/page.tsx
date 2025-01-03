'use client';

import React from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SectionHeader from '@/components/SectionHeader';

interface Client {
  name: string;
}

interface Deal {
  title: string;
  client: Client | null;
  status: string;
  clientOrProspectName: string;
  updateTime: string;
  stageName: string;
  stageOrderNr: number;
}

interface GroupedDeals {
  clientName: string;
  deals: Deal[];
}

interface DealsTableProps {
  title: string;
  subtitle: string;
  groupedDeals: GroupedDeals[];
}

interface StageSummary {
  stageName: string;
  stageOrderNr: number;
  prospectsCount: number;
  clientsCount: number;
  total: number;
  prospectsColumnPercentage: number;
  clientsColumnPercentage: number;
  prospectsRowPercentage: number;
  clientsRowPercentage: number;
  totalColumnPercentage: number;
}

function SummaryTable({ prospects, clientDeals }: { prospects: Deal[], clientDeals: Deal[] }) {
  const getStageSummaries = (): StageSummary[] => {
    const allDeals = [...prospects, ...clientDeals];
    const stages = new Map<string, StageSummary>();
    const grandTotal = allDeals.length;

    // Initialize stages with all unique stage names
    allDeals.forEach(deal => {
      if (!stages.has(deal.stageName)) {
        stages.set(deal.stageName, {
          stageName: deal.stageName,
          stageOrderNr: deal.stageOrderNr,
          prospectsCount: 0,
          clientsCount: 0,
          total: 0,
          prospectsColumnPercentage: 0,
          clientsColumnPercentage: 0,
          prospectsRowPercentage: 0,
          clientsRowPercentage: 0,
          totalColumnPercentage: 0
        });
      }
    });

    // Count deals for each stage
    prospects.forEach(deal => {
      const summary = stages.get(deal.stageName)!;
      summary.prospectsCount++;
      summary.total++;
    });

    clientDeals.forEach(deal => {
      const summary = stages.get(deal.stageName)!;
      summary.clientsCount++;
      summary.total++;
    });

    // Calculate percentages
    const totalProspects = prospects.length;
    const totalClients = clientDeals.length;

    stages.forEach(summary => {
      // Column percentages (relative to total of each column)
      summary.prospectsColumnPercentage = totalProspects > 0 ? (summary.prospectsCount / totalProspects) * 100 : 0;
      summary.clientsColumnPercentage = totalClients > 0 ? (summary.clientsCount / totalClients) * 100 : 0;
      summary.totalColumnPercentage = grandTotal > 0 ? (summary.total / grandTotal) * 100 : 0;
      
      // Row percentages (relative to row total)
      summary.prospectsRowPercentage = summary.total > 0 ? (summary.prospectsCount / summary.total) * 100 : 0;
      summary.clientsRowPercentage = summary.total > 0 ? (summary.clientsCount / summary.total) * 100 : 0;
    });

    // Convert to array and sort by stageOrderNr
    return Array.from(stages.values())
      .sort((a, b) => a.stageOrderNr - b.stageOrderNr);
  };

  const summaries = getStageSummaries();
  const totals = {
    prospectsCount: prospects.length,
    clientsCount: clientDeals.length,
    total: prospects.length + clientDeals.length,
    prospectsPercentage: 100,
    clientsPercentage: 100,
    totalPercentage: 100
  };

  return (
    <div className="mb-16">
      <SectionHeader title="Pipeline Summary" subtitle="Deals by stage" />
      <div className="ml-2 mr-2">
        <Table className="[&_tr>*:first-child]:border-l-0 [&_tr>*:last-child]:border-r-0">
          <TableHeader>
            <TableRow className="border-b-2 border-gray-200">
              <TableHead className="w-1/3 h-10 px-6 text-left align-middle font-medium text-muted-foreground border-x border-b">Stage</TableHead>
              <TableHead className="w-[80px] h-10 px-6 text-center align-middle font-medium text-muted-foreground border-x border-b">Prospects/Leads</TableHead>
              <TableHead className="w-[80px] h-10 px-6 text-center align-middle font-medium text-muted-foreground border-x border-b">Clients</TableHead>
              <TableHead className="w-[80px] h-10 px-6 text-center align-middle font-medium text-muted-foreground border-x border-b">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.map((summary) => (
              <TableRow key={summary.stageName} className="h-[57px] hover:bg-gray-50 border-b">
                <TableCell className="px-6 text-[12px] border-x">
                  {summary.stageName}
                </TableCell>
                <TableCell className="w-[80px] text-right relative border-x">
                  <div className="absolute top-0 left-1 text-[8px] text-gray-400">
                    {summary.prospectsRowPercentage > 0 && `${summary.prospectsRowPercentage.toFixed(1)}%`}
                  </div>
                  <div className="text-center">{summary.prospectsCount}</div>
                  <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1">
                    <span></span>
                    <span className="text-gray-400">
                      {summary.prospectsColumnPercentage > 0 && `${summary.prospectsColumnPercentage.toFixed(1)}%`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="w-[80px] text-right relative border-x">
                  <div className="absolute top-0 left-1 text-[8px] text-gray-400">
                    {summary.clientsRowPercentage > 0 && `${summary.clientsRowPercentage.toFixed(1)}%`}
                  </div>
                  <div className="text-center">{summary.clientsCount}</div>
                  <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1">
                    <span></span>
                    <span className="text-gray-400">
                      {summary.clientsColumnPercentage > 0 && `${summary.clientsColumnPercentage.toFixed(1)}%`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="w-[80px] text-right relative border-x">
                  <div className="text-center">{summary.total}</div>
                  <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1">
                    <span></span>
                    <span className="text-gray-400">
                      {summary.totalColumnPercentage > 0 && `${summary.totalColumnPercentage.toFixed(1)}%`}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="h-[57px] bg-gray-50 font-medium">
              <TableCell className="px-6 text-[12px] border-x">
                Total
              </TableCell>
              <TableCell className="w-[80px] text-right relative border-x">
                <div className="text-center">{totals.prospectsCount}</div>
                <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1">
                  <span></span>
                  <span className="text-gray-400">100%</span>
                </div>
              </TableCell>
              <TableCell className="w-[80px] text-right relative border-x">
                <div className="text-center">{totals.clientsCount}</div>
                <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1">
                  <span></span>
                  <span className="text-gray-400">100%</span>
                </div>
              </TableCell>
              <TableCell className="w-[80px] text-right relative border-x">
                <div className="text-center">{totals.total}</div>
                <div className="absolute bottom-0 w-full flex justify-between text-[8px] px-1">
                  <span></span>
                  <span className="text-gray-400">100%</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const GET_ACTIVE_DEALS = gql`
  query GetActiveDeals {
    activeDeals {
      title
      client {
        name
      }
      status
      clientOrProspectName
      updateTime
      stageName
      stageOrderNr
    }
  }
`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const getDaysSinceLastUpdate = (dateString: string) => {
  const lastUpdate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getRowHighlightClass = (updateTime: string) => {
  const daysSinceUpdate = getDaysSinceLastUpdate(updateTime);
  if (daysSinceUpdate > 90) return 'bg-red-50';
  if (daysSinceUpdate > 30) return 'bg-yellow-50';
  return '';
};

function DealsTable({ title, subtitle, groupedDeals }: DealsTableProps) {
  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="ml-2 mr-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-gray-200">
              <TableHead className="text-center w-12 h-10 align-middle font-medium text-muted-foreground">#</TableHead>
              <TableHead className="w-1/3 h-10 px-6 text-left align-middle font-medium text-muted-foreground border-x border-gray-100">Name</TableHead>
              <TableHead className="h-10 px-6 text-left align-middle font-medium text-muted-foreground border-x border-gray-100">Title</TableHead>
              <TableHead className="h-10 px-6 text-left align-middle font-medium text-muted-foreground border-x border-gray-100">Stage</TableHead>
              <TableHead className="h-10 px-6 text-left align-middle font-medium text-muted-foreground border-l border-gray-100">Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedDeals.map((group, groupIndex) => (
              group.deals.map((deal, index) => (
                <TableRow 
                  key={`${group.clientName}-${index}`}
                  className={`
                    h-[57px]
                    ${index === 0 ? "border-t-2 border-gray-200" : ""}
                    ${getRowHighlightClass(deal.updateTime)}
                  `}
                >
                  {index === 0 && (
                    <>
                      <TableCell 
                        className="text-center text-gray-500 text-[10px]"
                        rowSpan={group.deals.length}
                      >
                        {groupIndex + 1}
                      </TableCell>
                      <TableCell
                        className="px-6 text-[12px] border-x border-gray-100"
                        rowSpan={group.deals.length}
                      >
                        {group.clientName}
                      </TableCell>
                    </>
                  )}
                  {index !== 0 && (
                    <TableCell className="hidden" />
                  )}
                  <TableCell className="px-6 text-[12px] border-x border-gray-100">
                    {deal.title}
                  </TableCell>
                  <TableCell className="px-6 text-[12px] border-x border-gray-100">
                    {deal.stageName}
                  </TableCell>
                  <TableCell className="px-6 text-xs text-gray-500">
                    {formatDate(deal.updateTime)}
                  </TableCell>
                </TableRow>
              ))
            ))}
            {groupedDeals.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={5}
                  className="text-center text-gray-500 py-8 px-6"
                >
                  No deals found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { loading, error, data } = useQuery<{ activeDeals: Deal[] }>(GET_ACTIVE_DEALS);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error.message}</div>;

  const prospects = data?.activeDeals.filter(deal => !deal.client && deal.status === "open") ?? [];
  const clientDeals = data?.activeDeals.filter(deal => deal.client && deal.status === "open") ?? [];

  const groupDeals = (deals: Deal[]): GroupedDeals[] => {
    return deals.reduce<GroupedDeals[]>((acc, deal) => {
      const clientName = deal.client?.name || deal.clientOrProspectName;
      const existingGroup = acc.find(group => group.clientName === clientName);
      if (existingGroup) {
        existingGroup.deals.push(deal);
      } else {
        acc.push({ clientName, deals: [deal] });
      }
      return acc;
    }, []).sort((a, b) => a.clientName.localeCompare(b.clientName));
  };

  const groupedProspects = groupDeals(prospects);
  const groupedClientDeals = groupDeals(clientDeals);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SummaryTable prospects={prospects} clientDeals={clientDeals} />
      
      <DealsTable 
        title="Prospects and Qualified Leads"
        subtitle={`${groupedProspects.length} prospects/leads with ${prospects.length} open deals`}
        groupedDeals={groupedProspects}
      />
      
      <div className="mt-16">
        <DealsTable 
          title="Client Opportunities"
          subtitle={`${groupedClientDeals.length} clients with ${clientDeals.length} open deals`}
          groupedDeals={groupedClientDeals}
        />
      </div>
    </div>
  );
}
