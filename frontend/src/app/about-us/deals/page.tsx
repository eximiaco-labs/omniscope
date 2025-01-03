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
                  <TableCell className="px-6 text-xs text-gray-500">
                    {formatDate(deal.updateTime)}
                  </TableCell>
                </TableRow>
              ))
            ))}
            {groupedDeals.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={4} 
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
