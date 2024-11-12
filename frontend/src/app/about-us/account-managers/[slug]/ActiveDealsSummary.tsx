"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { AccountManager } from "./queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";

interface ActiveDealsSummaryProps {
  activeDeals: AccountManager['activeDeals'];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function ActiveDealsSummary({ activeDeals }: ActiveDealsSummaryProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const getDefaultSortKey = (cardTitle: string) => {
    return "clientOrProspectName";
  };

  const sortData = (items: any[], sortKey: string, direction: 'asc' | 'desc') => {
    const sortedItems = [...items].sort((a, b) => {
      let aValue = sortKey.includes('.') 
        ? sortKey.split('.').reduce((obj, key) => obj?.[key], a)
        : a[sortKey];
      let bValue = sortKey.includes('.')
        ? sortKey.split('.').reduce((obj, key) => obj?.[key], b)
        : b[sortKey];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      return direction === 'asc' 
        ? aValue < bValue ? -1 : 1
        : aValue > bValue ? -1 : 1;
    });
    return sortedItems;
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const summaryCards = [
    {
      title: "Active Deals",
      description: "Total number of active deals",
      count: activeDeals.length,
      items: activeDeals
    },
    {
      title: "With Existing Clients",
      description: "Deals with existing clients in our base",
      count: activeDeals.filter(d => d.client?.id).length,
      items: activeDeals.filter(d => d.client?.id)
    },
    {
      title: "With New Prospects",
      description: "Deals with prospects not yet in our base",
      count: activeDeals.filter(d => !d.client?.id).length,
      items: activeDeals.filter(d => !d.client?.id)
    }
  ];

  return (
    <div className="mb-4">
      <SectionHeader title="Active Deals Summary" subtitle="" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ml-2 mr-2">
        {summaryCards.map((card, index) => (
          <Card 
            key={card.title} 
            className={`transition-all duration-200 ${
              card.count === 0 ? "opacity-50" : "cursor-pointer"
            } ${
              selectedCard === card.title && card.count > 0
                ? "ring-2 ring-offset-2 ring-black scale-105"
                : card.count > 0
                ? "hover:scale-102 hover:shadow-md"
                : ""
            }`}
            onClick={() => {
              if (card.count > 0) {
                setSelectedCard(selectedCard === card.title ? null : card.title);
                if (card.title !== selectedCard) {
                  setSortConfig({
                    key: getDefaultSortKey(card.title),
                    direction: 'asc'
                  });
                }
              }
            }}
            role={card.count > 0 ? "button" : "presentation"}
            tabIndex={card.count > 0 ? 0 : -1}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
              <CardDescription className="text-sm text-gray-500">{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCard && (
        <div className="mt-4 ml-2 mr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('clientOrProspectName')}
                >
                  Client/Prospect {sortConfig.key === 'clientOrProspectName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Deal {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('stageName')}
                >
                  Stage {sortConfig.key === 'stageName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('daysSinceLastUpdate')}
                >
                  Days Since Update {sortConfig.key === 'daysSinceLastUpdate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortData(
                summaryCards.find(card => card.title === selectedCard)?.items || [],
                sortConfig.key || getDefaultSortKey(selectedCard),
                sortConfig.direction
              ).map((item) => (
                <TableRow key={`${item.clientOrProspectName}-${item.title}`}>
                  <TableCell className="font-medium">
                    {item.clientOrProspectName}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.stageName}</TableCell>
                  <TableCell>{item.daysSinceLastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
