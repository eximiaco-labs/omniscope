"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { AccountManager } from "./queries";
import SectionHeader from "@/components/SectionHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CasesSummaryProps {
  cases: AccountManager['cases'];
}

export function CasesSummary({ cases }: CasesSummaryProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

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
        return !(c.lastUpdate.status === "All Right");
      }).length,
      items: cases.filter(c => {
        if (!c.lastUpdate) return true;
        return !(c.lastUpdate.status === "All Right");
      })
    }
  ];

  return (
    <>
      <SectionHeader title="Cases summary" subtitle="" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8 ml-2 mr-2">
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
              }
            }}
            role={card.count > 0 ? "button" : "presentation"}
            tabIndex={card.count > 0 ? 0 : -1}
            onKeyDown={(e) => {
              if (card.count > 0 && (e.key === "Enter" || e.key === " ")) {
                setSelectedCard(selectedCard === card.title ? null : card.title);
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
                <TableHead>Case</TableHead>
                <TableHead>Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryCards.find(card => card.title === selectedCard)?.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.client.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}