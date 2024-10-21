import React from "react";
import { useQuery, gql } from "@apollo/client";
import ClientStatsSection from "@/app/components/ClientStatsSection";
import { Stat } from "@/app/components/analytics/stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankingIndicator from "@/components/RankingIndicator";

const GET_CLIENT_STATS = gql`
  query GetClientStats($accountManagerName: String, $filters: [FilterInput]) {
    clients(accountManagerName: $accountManagerName) {
      id
    }
    timesheet(slug: "last-six-weeks", kind: ALL, filters: $filters) {
      uniqueClients
      uniqueCases
      uniqueWorkers
      totalHours

      byKind {
        consulting {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        handsOn {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        squad {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        internal {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
      }

      byClient {
        name
        uniqueCases
        uniqueWorkers
        totalHours
        byKind {
          consulting {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          handsOn {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          squad {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          internal {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }
      }

      bySponsor {
        name
        uniqueCases
        uniqueWorkers
        totalHours
        byKind {
          consulting {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          handsOn {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          squad {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          internal {
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }
      }
    }
  }
`;

interface AccountManagerHomeProps {
  user: {
    name: string;
  };
}

const AccountManagerHome: React.FC<AccountManagerHomeProps> = ({ user }) => {
  const [selectedStat, setSelectedStat] = React.useState<string>("allClients");

  const { loading: statsLoading, data: clientStatsData } = useQuery(
    GET_CLIENT_STATS,
    {
      variables: {
        accountManagerName: user?.name || "",
        filters: [
          {
            field: "AccountManagerName",
            selectedValues: [user?.name || ""],
          },
        ],
      },
      skip: !user?.name,
    }
  );

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  if (statsLoading) {
    return <p>Loading stats...</p>;
  }

  const getSelectedStats = () => {
    if (!clientStatsData) return null;

    const allStats = clientStatsData.timesheet;
    const kindStats = {
      consulting: allStats.byKind.consulting,
      handsOn: allStats.byKind.handsOn,
      squad: allStats.byKind.squad,
      internal: allStats.byKind.internal,
    };

    switch (selectedStat) {
      case "allClients":
      case "total":
        return allStats;
      case "consulting":
      case "handsOn":
      case "squad":
      case "internal":
        return kindStats[selectedStat];
      default:
        return allStats;
    }
  };

  const selectedStats = getSelectedStats();

  const getStatColor = () => {
    switch (selectedStat) {
      case "consulting":
        return "#F59E0B";
      case "handsOn":
        return "#8B5CF6";
      case "squad":
        return "#3B82F6";
      case "internal":
        return "#10B981";
      default:
        return undefined;
    }
  };

  const filterItems = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") return true;
    return item.byKind[selectedStat].totalHours > 0;
  };

  const sortItems = (a: any, b: any) => {
    const getRelevantHours = (item: any) => {
      if (selectedStat === "allClients" || selectedStat === "total") {
        return item.totalHours;
      }
      return item.byKind[selectedStat].totalHours;
    };
    return getRelevantHours(b) - getRelevantHours(a);
  };

  const getItemValue = (item: any, field: string) => {
    if (selectedStat === "allClients" || selectedStat === "total") {
      return item[field];
    }
    return item.byKind[selectedStat][field];
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? Math.floor(hours) : hours.toFixed(1);
  };

  const calculatePercentage = (itemHours: number) => {
    const totalHours = selectedStats?.totalHours || 0;
    return totalHours > 0 ? ((itemHours / totalHours) * 100).toFixed(1) : "0.0";
  };

  return (
    <main>
      {clientStatsData && (
        <section className="mb-8">
          <ClientStatsSection
            data={clientStatsData}
            selectedStat={selectedStat}
            onStatClick={handleStatClick}
          />
          {selectedStats && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Stat
                title="Unique Cases"
                value={selectedStats.uniqueCases.toString()}
                color={getStatColor()}
              />
              <Stat
                title="Unique Workers"
                value={selectedStats.uniqueWorkers.toString()}
                color={getStatColor()}
              />
              <Stat
                title="Total Hours"
                value={selectedStats.totalHours.toFixed(1)}
                color={getStatColor()}
              />
            </div>
          )}
        </section>
      )}

      {clientStatsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {clientStatsData.timesheet.byClient.filter(filterItems).length > 10
                  ? "Top 10 Clients"
                  : "Clients"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full table-fixed">
                <TableHead>
                  <TableRow className="bg-gray-100">
                    <TableHeader className="font-semibold text-left w-5/12">Client</TableHeader>
                    <TableHeader className="font-semibold text-center w-2/12">Cases</TableHeader>
                    <TableHeader className="font-semibold text-center w-2/12">Workers</TableHeader>
                    <TableHeader className="font-semibold text-center w-3/12">Hours</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientStatsData.timesheet.byClient
                    .filter(filterItems)
                    .sort(sortItems)
                    .slice(0, 10)
                    .map((client: any, index: number) => (
                      <TableRow 
                        key={client.name}
                        className={`animate-fadeIn hover:bg-gray-50 transition-colors duration-150 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <RankingIndicator
                              index={index + 1}
                              percentage={calculatePercentage(getItemValue(client, 'totalHours'))}
                            />
                            <span>{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getItemValue(client, 'uniqueCases')}</TableCell>
                        <TableCell className="text-center">{getItemValue(client, 'uniqueWorkers')}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{formatHours(getItemValue(client, 'totalHours'))}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {clientStatsData.timesheet.bySponsor.filter(filterItems).length > 10
                  ? "Top 10 Sponsors"
                  : "Sponsors"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full table-fixed">
                <TableHead>
                  <TableRow className="bg-gray-100">
                    <TableHeader className="font-semibold text-left w-5/12">Sponsor</TableHeader>
                    <TableHeader className="font-semibold text-center w-2/12">Cases</TableHeader>
                    <TableHeader className="font-semibold text-center w-2/12">Workers</TableHeader>
                    <TableHeader className="font-semibold text-center w-3/12">Hours</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientStatsData.timesheet.bySponsor
                    .filter(filterItems)
                    .sort(sortItems)
                    .slice(0, 10)
                    .map((sponsor: any, index: number) => (
                      <TableRow 
                        key={sponsor.name}
                        className={`animate-fadeIn hover:bg-gray-50 transition-colors duration-150 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <RankingIndicator
                              index={index + 1}
                              percentage={calculatePercentage(getItemValue(sponsor, 'totalHours'))}
                            />
                            <span>{sponsor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getItemValue(sponsor, 'uniqueCases')}</TableCell>
                        <TableCell className="text-center">{getItemValue(sponsor, 'uniqueWorkers')}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{formatHours(getItemValue(sponsor, 'totalHours'))}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default AccountManagerHome;
