"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { REVENUE_TRACKING_QUERY } from "./query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAT_COLORS } from "@/app/constants/colors";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";

export default function RevenuePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [selectedKind, setSelectedKind] = useState<string>('total');

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const { loading, error, data } = useQuery(REVENUE_TRACKING_QUERY, {
    variables: { date: format(date, "yyyy-MM-dd") }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const calculateProjectTotal = (projects: any[], kind?: string) => {
    return projects.reduce((sum, project) => {
      if (kind && project.kind !== kind) return sum;
      return sum + project.fee;
    }, 0);
  };

  const calculateCaseTotal = (cases: any[], kind?: string) => {
    return cases.reduce((sum, caseItem) => {
      const filteredProjects = kind 
        ? caseItem.byProject.filter((p: any) => p.kind === kind)
        : caseItem.byProject;
      return sum + calculateProjectTotal(filteredProjects, kind);
    }, 0);
  };

  const calculateClientTotal = (clients: any[], kind?: string) => {
    return clients.reduce((sum, client) => {
      return sum + calculateCaseTotal(client.byCase, kind);
    }, 0);
  };

  const calculateManagerTotal = (managers: any[], kind?: string) => {
    return managers.reduce((sum, manager) => {
      return sum + calculateClientTotal(manager.byClient, kind);
    }, 0);
  };

  const handleStatClick = (kind: string) => {
    setSelectedKind(kind === selectedKind ? 'total' : kind);
  };

  const getStatClassName = (kind: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedKind === kind ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const filterDataByKind = (managers: any[]) => {
    if (selectedKind === 'total') return managers;

    return managers
      .map(manager => ({
        ...manager,
        byClient: manager.byClient
          .map((client: any) => ({
            ...client,
            byCase: client.byCase
              .map((caseItem: any) => ({
                ...caseItem,
                byProject: caseItem.byProject.filter((project: any) => project.kind === selectedKind)
              }))
              .filter((caseItem: any) => caseItem.byProject.length > 0)
          }))
          .filter((client: any) => client.byCase.length > 0)
      }))
      .filter((manager: any) => manager.byClient.length > 0);
  };

  const totalValue = data.revenueTracking.fixed.monthly.total;
  const consultingValue = calculateManagerTotal(data.revenueTracking.fixed.monthly.byAccountManager, 'consulting');
  const handsOnValue = calculateManagerTotal(data.revenueTracking.fixed.monthly.byAccountManager, 'handsOn');
  const squadValue = calculateManagerTotal(data.revenueTracking.fixed.monthly.byAccountManager, 'squad');

  const filteredManagers = filterDataByKind(data.revenueTracking.fixed.monthly.byAccountManager);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <div className="ml-2 mr-2">
        <SectionHeader title="Fixed Fee Revenue Tracking" subtitle={format(date, "MMMM / yyyy")} />
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div
            className={getStatClassName('total')}
            onClick={() => handleStatClick('total')}
          >
            <Stat
              title="Total Revenue"
              value={totalValue.toString()}
              formatter={formatCurrency}
            />
          </div>
          <div
            className={getStatClassName('consulting')}
            onClick={() => handleStatClick('consulting')}
          >
            <Stat
              title="Consulting Revenue"
              value={consultingValue.toString()}
              color="#F59E0B"
              total={totalValue}
              formatter={formatCurrency}
            />
          </div>
          <div
            className={getStatClassName('handsOn')}
            onClick={() => handleStatClick('handsOn')}
          >
            <Stat
              title="Hands-On Revenue"
              value={handsOnValue.toString()}
              color="#8B5CF6"
              total={totalValue}
              formatter={formatCurrency}
            />
          </div>
          <div
            className={getStatClassName('squad')}
            onClick={() => handleStatClick('squad')}
          >
            <Stat
              title="Squad Revenue"
              value={squadValue.toString()}
              color="#3B82F6"
              total={totalValue}
              formatter={formatCurrency}
            />
          </div>
        </div>

        <Divider className="my-4" />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Manager / Client / Case</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManagers.map((manager: any) => (
              <>
                <TableRow key={manager.name} className="bg-gray-100">
                  <TableCell className="text-sm font-semibold">
                    {manager.name}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">{formatCurrency(calculateClientTotal(manager.byClient, selectedKind !== 'total' ? selectedKind : undefined))}</TableCell>
                </TableRow>

                {manager.byClient.map((client: any) => (
                  <>
                    <TableRow 
                      key={`${manager.name}-${client.name}`}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleClient(client.name)}
                    >
                      <TableCell className="text-sm text-gray-600 flex items-center gap-2 pl-8">
                        {expandedClients.has(client.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {client.name}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">{formatCurrency(calculateCaseTotal(client.byCase, selectedKind !== 'total' ? selectedKind : undefined))}</TableCell>
                    </TableRow>

                    {expandedClients.has(client.name) && client.byCase.map((caseItem: any) => (
                      <TableRow key={`${client.name}-${caseItem.title}`} className="bg-gray-50">
                        <TableCell className="pl-16 text-sm text-gray-600">
                          {caseItem.title}
                        </TableCell>
                        <TableCell>
                          <table className="w-full text-xs border-collapse">
                            <tbody>
                              {caseItem.byProject.map((project: any) => {
                                const textColor = STAT_COLORS[project.kind as keyof typeof STAT_COLORS];
                                
                                return (
                                  <tr key={project.name} className="border-b border-gray-200">
                                    <td className="pr-2 w-[250px] break-words border-r border-gray-200">
                                      <div style={{ color: textColor }}>
                                        {project.name}
                                      </div>
                                    </td>
                                    <td className="text-gray-600 pl-2 w-[100px]">{project.kind}</td>
                                    <td className="text-gray-600 pl-2 text-right">{formatCurrency(project.fee)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(calculateProjectTotal(caseItem.byProject, selectedKind !== 'total' ? selectedKind : undefined))}</TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </>
            ))}
            <TableRow className="font-bold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateManagerTotal(filteredManagers, selectedKind !== 'total' ? selectedKind : undefined))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
