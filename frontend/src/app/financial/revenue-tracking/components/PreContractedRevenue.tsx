import { format } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAT_COLORS } from "@/app/constants/colors";
import Link from "next/link";

interface PreContractedRevenueProps {
  data: any;
  date: Date;
}

export function PreContractedRevenue({
  data,
  date,
}: PreContractedRevenueProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set()
  );
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(
    new Set()
  );
  const [selectedKind, setSelectedKind] = useState<string>("total");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const toggleSponsor = (sponsorName: string) => {
    const newExpanded = new Set(expandedSponsors);
    if (newExpanded.has(sponsorName)) {
      newExpanded.delete(sponsorName);
    } else {
      newExpanded.add(sponsorName);
    }
    setExpandedSponsors(newExpanded);
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
        ? caseItem.byProject.data.filter((p: any) => p.kind === kind)
        : caseItem.byProject.data;
      return sum + calculateProjectTotal(filteredProjects, kind);
    }, 0);
  };

  const calculateSponsorTotal = (sponsors: any[], kind?: string) => {
    return sponsors.reduce((sum, sponsor) => {
      return sum + calculateCaseTotal(sponsor.byCase.data, kind);
    }, 0);
  };

  const calculateClientTotal = (clients: any[], kind?: string) => {
    return clients.reduce((sum, client) => {
      return sum + calculateSponsorTotal(client.bySponsor.data, kind);
    }, 0);
  };

  const calculateManagerTotal = (managers: any[], kind?: string) => {
    return managers.reduce((sum, manager) => {
      return sum + calculateClientTotal(manager.byClient.data, kind);
    }, 0);
  };

  const handleStatClick = (kind: string) => {
    setSelectedKind(kind === selectedKind ? "total" : kind);
  };

  const getStatClassName = (kind: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedKind === kind
        ? "ring-2 ring-black shadow-lg scale-105"
        : "hover:scale-102"
    }`;
  };

  const filterDataByKind = (managers: any[]) => {
    if (selectedKind === "total") return managers;

    return managers
      .map((manager) => ({
        ...manager,
        byClient: {
          data: manager.byClient.data
            .map((client: any) => ({
              ...client,
              bySponsor: {
                data: client.bySponsor.data
                  .map((sponsor: any) => ({
                    ...sponsor,
                    byCase: {
                      data: sponsor.byCase.data
                        .map((caseItem: any) => ({
                          ...caseItem,
                          byProject: {
                            data: caseItem.byProject.data.filter(
                              (project: any) => project.kind === selectedKind
                            ),
                          },
                        }))
                        .filter((caseItem: any) => caseItem.byProject.data.length > 0),
                    },
                  }))
                  .filter((sponsor: any) => sponsor.byCase.data.length > 0),
              },
            }))
            .filter((client: any) => client.bySponsor.data.length > 0),
        },
      }))
      .filter((manager: any) => manager.byClient.data.length > 0);
  };

  const preContracted = data?.financial?.revenueTracking?.preContracted?.monthly;
  const managers = preContracted?.byAccountManager?.data || [];

  const totalValue = preContracted?.total || 0;
  const consultingValue = calculateManagerTotal(
    managers,
    "consulting"
  );
  const handsOnValue = calculateManagerTotal(
    managers,
    "handsOn"
  );
  const squadValue = calculateManagerTotal(
    managers,
    "squad"
  );

  const filteredManagers = filterDataByKind(managers);

  return (
    <>
      <SectionHeader
        title="Pre-contracted Revenue"
        subtitle={format(date, "MMMM / yyyy")}
      />

      <div className="px-2 mt-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div
            className={getStatClassName("total")}
            onClick={() => handleStatClick("total")}
          >
            <Stat
              title="Total Revenue"
              value={totalValue.toString()}
              formatter={formatCurrency}
            />
          </div>
          <div
            className={getStatClassName("consulting")}
            onClick={() => handleStatClick("consulting")}
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
            className={getStatClassName("handsOn")}
            onClick={() => handleStatClick("handsOn")}
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
            className={getStatClassName("squad")}
            onClick={() => handleStatClick("squad")}
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Manager / Client / Sponsor / Case</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManagers.map((manager: any) => (
              <>
                <TableRow key={manager.name} className="bg-gray-100">
                  <TableCell className="text-sm font-semibold">
                    {manager.slug ? (
                      <Link href={`/about-us/account-managers/${manager.slug}`} className="text-blue-600 hover:underline">
                        {manager.name}
                      </Link>
                    ) : (
                      manager.name
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      calculateClientTotal(
                        manager.byClient.data,
                        selectedKind !== "total" ? selectedKind : undefined
                      )
                    )}
                  </TableCell>
                </TableRow>

                {manager.byClient.data.map((client: any) => (
                  <>
                    <TableRow
                      key={`${manager.name}-${client.name}`}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleClient(client.name)}
                    >
                      <TableCell className="text-sm text-gray-600 flex items-center gap-2 pl-8">
                        {expandedClients.has(client.name) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        {client.slug ? (
                          <Link href={`/about-us/clients/${client.slug}`} className="text-blue-600 hover:underline">
                            {client.name}
                          </Link>
                        ) : (
                          client.name
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateSponsorTotal(
                            client.bySponsor.data,
                            selectedKind !== "total" ? selectedKind : undefined
                          )
                        )}
                      </TableCell>
                    </TableRow>

                    {expandedClients.has(client.name) &&
                      client.bySponsor.data.map((sponsor: any) => (
                        <>
                          <TableRow
                            key={`${client.name}-${sponsor.name}`}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSponsor(sponsor.name)}
                          >
                            <TableCell className="text-sm text-gray-600 flex items-center gap-2 pl-12">
                              {expandedSponsors.has(sponsor.name) ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                              {sponsor.slug ? (
                                <Link href={`/about-us/sponsors/${sponsor.slug}`} className="text-blue-600 hover:underline">
                                  {sponsor.name}
                                </Link>
                              ) : (
                                sponsor.name
                              )}
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(
                                calculateCaseTotal(
                                  sponsor.byCase.data,
                                  selectedKind !== "total" ? selectedKind : undefined
                                )
                              )}
                            </TableCell>
                          </TableRow>

                          {expandedSponsors.has(sponsor.name) &&
                            sponsor.byCase.data.map((caseItem: any) => (
                              <TableRow
                                key={`${sponsor.name}-${caseItem.title}`}
                                className="bg-gray-50"
                              >
                                <TableCell className="pl-16 text-sm text-gray-600">
                                  {caseItem.slug ? (
                                    <Link href={`/about-us/cases/${caseItem.slug}`} className="text-blue-600 hover:underline">
                                      {caseItem.title}
                                    </Link>
                                  ) : (
                                    caseItem.title
                                  )}
                                </TableCell>
                                <TableCell>
                                  <table className="w-full text-xs border-collapse">
                                    <tbody>
                                      {caseItem.byProject.data.map(
                                        (project: any) => {
                                          const textColor =
                                            STAT_COLORS[
                                              project.kind as keyof typeof STAT_COLORS
                                            ];

                                          return (
                                            <tr
                                              key={project.name}
                                              className="border-b border-gray-200"
                                            >
                                              <td className="pr-2 w-[250px] break-words border-r border-gray-200">
                                                <div
                                                  style={{ color: textColor }}
                                                >
                                                  {project.name}
                                                </div>
                                              </td>
                                              <td className="text-gray-600 pl-2 w-[100px]">
                                                {project.rate}/h
                                              </td>
                                              <td className="text-gray-600 pl-2 w-[100px]">
                                                {project.hours}h
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  </table>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(
                                    calculateProjectTotal(
                                      caseItem.byProject.data,
                                      selectedKind !== "total" ? selectedKind : undefined
                                    )
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </>
                      ))}
                  </>
                ))}
              </>
            ))}
            <TableRow className="font-bold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateManagerTotal(managers))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
