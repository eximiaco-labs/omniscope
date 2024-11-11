"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { AccountManager } from "./queries";
import SectionHeader from "@/components/SectionHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "react-day-picker";
import { Badge } from "@/components/catalyst/badge";

interface CasesSummaryProps {
  cases: AccountManager['cases'];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function CasesSummary({ cases }: CasesSummaryProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const getDefaultSortKey = (cardTitle: string) => {
    switch (cardTitle) {
      case "Ending Soon":
        return "endOfContract";
      case "Stale Updates":
        return "lastUpdated";
      default:
        return "client.name";
    }
  };

  const sortData = (items: any[], sortKey: string, direction: 'asc' | 'desc') => {
    const sortedItems = [...items].sort((a, b) => {
      let aValue = sortKey.includes('.') 
        ? sortKey.split('.').reduce((obj, key) => obj?.[key], a)
        : a[sortKey];
      let bValue = sortKey.includes('.')
        ? sortKey.split('.').reduce((obj, key) => obj?.[key], b)
        : b[sortKey];

      if (sortKey === 'endOfContract' || sortKey === 'lastUpdated') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

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
      title: "Active Cases",
      description: "Total number of active cases being managed",
      count: cases.length,
      items: cases
    },
    {
      title: "Missing Description", 
      description: "Cases that need description added",
      count: cases.filter(c => !c.hasDescription).length,
      items: cases.filter(c => !c.hasDescription)
    },
    {
      title: "Stale Updates",
      description: "Cases that haven't been updated in over 30 days",
      count: cases.filter(c => {
        if (!c.lastUpdate) return true;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const lastUpdateDate = new Date(c.lastUpdate.date);
        const now = new Date();
        return now.getTime() - lastUpdateDate.getTime() > thirtyDaysInMs;
      }).length,
      items: cases.filter(c => {
        if (!c.lastUpdate) return true;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const lastUpdateDate = new Date(c.lastUpdate.date);
        const now = new Date();
        return now.getTime() - lastUpdateDate.getTime() > thirtyDaysInMs;
      })
    },
    {
      title: "Ending Soon",
      description: "Cases ending within 30 days",
      count: cases.filter(c => {
        if (!c.endOfContract) return true;
        const endOfContractDate = new Date(c.endOfContract);
        const now = new Date();
        const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
        return endOfContractDate.getTime() - now.getTime() < oneMonthInMs;
      }).length,
      items: cases.filter(c => {
        if (!c.endOfContract) return true;
        const endOfContractDate = new Date(c.endOfContract);
        const now = new Date();
        const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
        return endOfContractDate.getTime() - now.getTime() < oneMonthInMs;
      })
    },
    {
      title: "Needs Attention",
      description: "Cases with issues or concerns", 
      count: cases.filter(c => {
        if (!c.lastUpdate) return true;
        return !(c.lastUpdate.status === "All right");
      }).length,
      items: cases.filter(c => {
        if (!c.lastUpdate) return true;
        return !(c.lastUpdate.status === "All right");
      })
    }
  ];

  return (
    <div className="mb-4">
      <SectionHeader title="Cases summary" subtitle="" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 ml-2 mr-2">
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
            } ${
              index > 0 && card.count > 0 ? "bg-red-600 text-white" : ""
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
            onKeyDown={(e) => {
              if (card.count > 0 && (e.key === "Enter" || e.key === " ")) {
                setSelectedCard(selectedCard === card.title ? null : card.title);
                if (card.title !== selectedCard) {
                  setSortConfig({
                    key: getDefaultSortKey(card.title),
                    direction: 'asc'
                  });
                }
              }
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg font-semibold ${index > 0 && card.count > 0 ? "text-white" : ""}`}>{card.title}</CardTitle>
              <CardDescription className={`text-sm ${index > 0 && card.count > 0 ? "text-white/80" : "text-gray-500"}`}>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${index > 0 && card.count > 0 ? "text-white" : ""}`}>{card.count}</p>
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
                  className="w-[150px] cursor-pointer"
                  onClick={() => handleSort('client.name')}
                >
                  Client {sortConfig.key === 'client.name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Case {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="w-[150px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort('endOfContract')}
                >
                  Ending {sortConfig.key === 'endOfContract' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="w-[150px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort('lastUpdated')}
                >
                  Last Update {sortConfig.key === 'lastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortData(
                summaryCards.find(card => card.title === selectedCard)?.items || [],
                sortConfig.key || getDefaultSortKey(selectedCard),
                sortConfig.direction
              ).map((item) => (
                  <TableRow key={`${item.client.name}-${item.title}`}>
                    <TableCell className="font-medium w-[150px]">
                      {item.client.name}
                    </TableCell>
                    <TableCell>
                      <span>
                        {item.title}{" "}
                        {(!item.lastUpdate?.status || item.lastUpdate.status !== "All right") && (
                          <Badge
                            color={
                              !item.lastUpdate?.status ? "zinc" :
                              item.lastUpdate.status === "Requires attention" ? "yellow" :
                              item.lastUpdate.status === "Critical" ? "red" : "zinc"
                            }
                          >
                            {item.lastUpdate?.status || "No updates"}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.endOfContract ? 
                        new Date(item.endOfContract).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.lastUpdated ? 
                        new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {item.lastUpdate?.observations ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Observations</DialogTitle>
                              <div className="text-sm text-gray-500">
                                by {item.lastUpdate.author} on {item.lastUpdate.date ? new Date(item.lastUpdate.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                              </div>
                            </DialogHeader>
                            <div className="mt-4 whitespace-pre-wrap">
                              <div dangerouslySetInnerHTML={{ __html: item.lastUpdate.observations }} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        ''
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}