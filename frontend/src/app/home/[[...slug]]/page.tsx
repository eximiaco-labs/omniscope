"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";
import { useParams } from "next/navigation";
import ClientStatsSection from "@/app/components/ClientStatsSection";
import { Stat } from "@/app/components/analytics/stat";

const GET_USER = gql`
  query GetUser($slug: String, $email: String) {
    user(slug: $slug, email: $email) {
      name
      photoUrl
      email
      position
    }
  }
`;

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
    }
  }
`;

export default function HomePage() {
  const { data: session } = useSession();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : undefined;
  const [selectedStat, setSelectedStat] = React.useState<string>("allClients");

  const { loading: userLoading, data: userData } = useQuery(GET_USER, {
    variables: {
      slug: slug || undefined,
      email: !slug ? session?.user?.email : undefined,
    },
    skip: !slug && !session?.user?.email,
  });

  const user = userData?.user;

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

  if (userLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
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
      case 'allClients':
      case 'total':
        return allStats;
      case 'consulting':
      case 'handsOn':
      case 'squad':
      case 'internal':
        return kindStats[selectedStat];
      default:
        return allStats;
    }
  };

  const selectedStats = getSelectedStats();

  const getStatColor = () => {
    switch (selectedStat) {
      case 'consulting':
        return "#F59E0B";
      case 'handsOn':
        return "#8B5CF6";
      case 'squad':
        return "#3B82F6";
      case 'internal':
        return "#10B981";
      default:
        return undefined;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar
              src={user?.photoUrl || "/profile-photo.jpg"}
              className="h-20 w-20 rounded-full ring-4 ring-blue-500 mr-6"
              alt={user?.name || "User"}
            />
            <div>
              <Heading className="text-3xl font-bold text-gray-800">
                Welcome back, {user?.name || "User"}!
              </Heading>
              {user?.position && (
                <p className="text-lg text-gray-600 mt-1">{user.position}</p>
              )}
            </div>
          </div>
          {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
        </div>
      </header>

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

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upcoming Tasks
          </h2>
          {/* Add placeholders for tasks or events */}
          <p className="text-gray-600">No upcoming tasks at the moment.</p>
        </section>
      </main>
    </div>
  );
}
