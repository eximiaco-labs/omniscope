import React from "react";
import { useQuery } from "@apollo/client";
import ClientStatsSection from "@/app/components/ClientStatsSection";
import { Stat } from "@/app/components/analytics/stat";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

import { GET_CLIENT_STATS } from "./AccountManagerHomeQueries";
import TopClients from "./panels/TopClients";
import TopSponsors from "./panels/TopSponsors";
import TopWorkers from "./panels/TopWorkers";
import CasesByContractEnd from "./panels/CasesByContractEnd";
import CasesUpdates from "./panels/CasesUpdates";

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
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2 }}>
          <Masonry gutter="1rem">
            <TopClients
              clientData={clientStatsData.timesheet.byClient}
              selectedStat={selectedStat}
              totalHours={selectedStats?.totalHours || 0}
            />
            <TopSponsors
              sponsorData={clientStatsData.timesheet.bySponsor}
              selectedStat={selectedStat}
              totalHours={selectedStats?.totalHours || 0}
            />
            <TopWorkers
              workerData={clientStatsData.timesheet.byWorker}
              selectedStat={selectedStat}
              totalHours={selectedStats?.totalHours || 0}
            />
            <CasesByContractEnd
              caseData={clientStatsData.timesheet.byCase}
              selectedStat={selectedStat}
            />
            <CasesUpdates
              caseData={clientStatsData.timesheet.byCase}
              selectedStat={selectedStat}
            />
          </Masonry>
        </ResponsiveMasonry>
      )}
    </main>
  );
};

export default AccountManagerHome;
