import React from "react";
import { useQuery } from "@apollo/client";
import ClientStatsSection from "@/app/components/ClientStatsSection";
import { Stat } from "@/app/components/analytics/stat";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

import { GET_HOME_DATA } from "./ConsultantOrEngineerHomeQueries";
import TopClients from "./panels/TopClients";
import TopSponsors from "./panels/TopSponsors";
import CasesByContractEnd from "./panels/CasesByContractEnd";
import CasesUpdates from "./panels/CasesUpdates";

import TimelinessPanel from "@/app/analytics/week-review/TimelinessPanel";
import { motion } from "framer-motion";

interface ConsultantOrEngineerHomeProps {
  user: {
    name: string;
  };
}

const ConsultantOrEngineerHome: React.FC<ConsultantOrEngineerHomeProps> = ({
  user,
}) => {
  const [selectedStat, setSelectedStat] = React.useState<string>("total");

  const { loading: statsLoading, data: clientStatsData } = useQuery(
    GET_HOME_DATA,
    {
      variables: {
        filters: [
          {
            field: "WorkerName",
            selectedValues: [user?.name || ""],
          },
        ],
        dateOfInterest: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
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

  const getComparisonColor = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return "text-green-600";
    if (diff < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getComparisonPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percentage = ((current - previous) / previous) * 100;
    return percentage > 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`;
  };
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
        <section className="">
          <ClientStatsSection
            data={clientStatsData}
            selectedStat={selectedStat}
            onStatClick={handleStatClick}
          />
          {selectedStats && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Stat
                title="Unique Clients"
                value={selectedStats.uniqueClients.toString()}
                color={getStatColor()}
              />
              <Stat
                title="Unique Cases"
                value={selectedStats.uniqueCases.toString()}
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
        <>
          <div className="grid grid-cols-7 gap-2">
            <motion.div
              className="col-span-4 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              {/* Header */}
              <motion.div
                className="p-2 border-b border-gray-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm font-bold">Time Tracking Summary</div>
              </motion.div>

              {/* Content */}
              <motion.div
                className="p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {clientStatsData?.weekReview && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium">This Week</p>
                        <p className="text-lg font-bold">{clientStatsData.weekReview.hoursThisWeek.toFixed(1)}h</p>
                        <p className={`text-xs ${getComparisonColor(clientStatsData.weekReview.hoursThisWeek, clientStatsData.weekReview.hoursPreviousWeeksUntilThisDate)}`}>
                          {getComparisonPercentage(clientStatsData.weekReview.hoursThisWeek, clientStatsData.weekReview.hoursPreviousWeeksUntilThisDate)} vs Last Week
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">{new Date().toLocaleString('en-US', { month: 'long' })}</p>
                        <p className="text-lg font-bold">{clientStatsData.weekReview.monthSummary.hoursThisMonth.toFixed(1)}h</p>
                        <p className={`text-xs ${getComparisonColor(clientStatsData.weekReview.monthSummary.hoursThisMonth, clientStatsData.weekReview.monthSummary.hoursPreviousMonthUntilThisDate)}`}>
                          {getComparisonPercentage(clientStatsData.weekReview.monthSummary.hoursThisMonth, clientStatsData.weekReview.monthSummary.hoursPreviousMonthUntilThisDate)} vs {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('en-US', { month: 'long' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="bg-gray-50 p-3 rounded-md flex-1">
                        <p className="text-xs font-medium mb-2">Previous Weeks</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs">Up to {new Date().toLocaleString('en-US', {weekday: 'long'})}</p>
                            <p className="text-sm font-bold">{clientStatsData.weekReview.hoursPreviousWeeksUntilThisDate.toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-xs">Total</p>
                            <p className="text-sm font-bold">{clientStatsData.weekReview.hoursPreviousWeeks.toFixed(1)}h</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md flex-1">
                        <p className="text-xs font-medium mb-2">{new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('en-US', { month: 'long' })}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs">Up to the {new Date().getDate()}{['st', 'nd', 'rd'][((new Date().getDate()+90)%100-10)%10-1] || 'th'}</p>
                            <p className="text-sm font-bold">{clientStatsData.weekReview.monthSummary.hoursPreviousMonthUntilThisDate.toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-xs">Total</p>
                            <p className="text-sm font-bold">{clientStatsData.weekReview.monthSummary.hoursPreviousMonth.toFixed(1)}h</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
            <div className="col-span-3">
              <TimelinessPanel data={clientStatsData?.timelinessReview} />
            </div>
          </div>

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
        </>
      )}
    </main>
  );
};

export default ConsultantOrEngineerHome;
