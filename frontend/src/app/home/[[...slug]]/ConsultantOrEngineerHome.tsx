import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import ClientStatsSection from "@/app/components/ClientStatsSection";
import { Stat } from "@/app/components/analytics/stat";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

import { GET_DATA, GET_ANALYTICS } from "./ConsultantOrEngineerHomeQueries";
import TopClients from "./panels/TopClients";
import TopSponsors from "./panels/TopSponsors";
import CasesByContractEnd from "./panels/CasesByContractEnd";
import CasesUpdates from "./panels/CasesUpdates";

import TimelinessPanel from "@/app/analytics/week-review/TimelinessPanel";
import { motion } from "framer-motion";
import { animated, useSpring } from "@react-spring/web";

interface ConsultantOrEngineerHomeProps {
  user: {
    name: string;
  };
}

const ConsultantOrEngineerHome: React.FC<ConsultantOrEngineerHomeProps> = ({
  user,
}) => {
  const [selectedStat, setSelectedStat] = useState<string>("total");
  const [clientStatsData, setClientStatsData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const { loading: dataLoading, data: rawClientStatsData } = useQuery(
    GET_DATA,
    {
      variables: {
        filters: [
          {
            field: "WorkerName",
            selectedValues: [user?.name || ""],
          },
        ],
      },
      skip: !user?.name,
    }
  );

  const { loading: analyticsLoading, data: rawAnalyticsData } = useQuery(
    GET_ANALYTICS,
    {
      variables: {
        filters: [
          {
            field: "WorkerName",
            selectedValues: [user?.name || ""],
          },
          ...(selectedStat !== "total"
            ? [
                {
                  field: "Kind",
                  selectedValues: [
                    selectedStat === "handsOn"
                      ? "HandsOn"
                      : selectedStat.charAt(0).toUpperCase() +
                        selectedStat.slice(1),
                  ],
                },
              ]
            : []),
        ],
        dateOfInterest: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      },
      skip: !user?.name,
    }
  );

  useEffect(() => {
    if (rawClientStatsData) {
      setClientStatsData(rawClientStatsData);
    }
  }, [rawClientStatsData]);

  useEffect(() => {
    if (rawAnalyticsData) {
      setAnalyticsData(rawAnalyticsData);
    }
  }, [rawAnalyticsData]);

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getComparisonColor = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return "text-green-600";
    if (diff < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getComparisonPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percentage = ((current - previous) / previous) * 100;
    return percentage > 0
      ? `+${percentage.toFixed(1)}%`
      : `${percentage.toFixed(1)}%`;
  };

  const getSelectedStats = useMemo(() => {
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
  }, [clientStatsData, selectedStat]);

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

  const weekReviewSpring = useSpring({
    from: { number: 0 },
    to: { number: analyticsData?.weekReview?.hoursThisWeek || 0 },
    config: { duration: 500 }
  });

  const monthSummarySpring = useSpring({
    from: { number: 0 },
    to: { number: analyticsData?.weekReview?.monthSummary?.hoursThisMonth || 0 },
    config: { duration: 500 }
  });

  const previousWeeksUntilThisDateSpring = useSpring({
    from: { number: 0 },
    to: { number: analyticsData?.weekReview?.hoursPreviousWeeksUntilThisDate || 0 },
    config: { duration: 500 }
  });

  const previousWeeksSpring = useSpring({
    from: { number: 0 },
    to: { number: analyticsData?.weekReview?.hoursPreviousWeeks || 0 },
    config: { duration: 500 }
  });

  const previousMonthUntilThisDateSpring = useSpring({
    from: { number: 0 },
    to: { number: analyticsData?.weekReview?.monthSummary?.hoursPreviousMonthUntilThisDate || 0 },
    config: { duration: 500 }
  });

  const previousMonthSpring = useSpring({
    from: { number: 0 },
    to: { number: analyticsData?.weekReview?.monthSummary?.hoursPreviousMonth || 0 },
    config: { duration: 500 }
  });

  if (dataLoading || analyticsLoading) {
    return <p>Loading stats...</p>;
  }

  return (
    <main>
      <section className="">
        <ClientStatsSection
          data={clientStatsData}
          selectedStat={selectedStat}
          onStatClick={handleStatClick}
        />
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Stat
            title="Unique Clients"
            value={getSelectedStats?.uniqueClients?.toString() ?? "N/A"}
            color={getStatColor()}
          />
          <Stat
            title="Unique Cases"
            value={getSelectedStats?.uniqueCases?.toString() ?? "N/A"}
            color={getStatColor()}
          />
          <Stat
            title="Total Hours"
            value={getSelectedStats?.totalHours?.toFixed(1) ?? "N/A"}
            color={getStatColor()}
          />
        </div>
      </section>

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
            {analyticsData?.weekReview && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium">This Week</p>
                    <motion.p 
                      className="text-lg font-bold"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <animated.span>
                        {weekReviewSpring.number.to((n) => n.toFixed(1))}
                      </animated.span>h
                    </motion.p>
                    <motion.p
                      className={`text-xs ${getComparisonColor(
                        analyticsData.weekReview.hoursThisWeek,
                        analyticsData.weekReview.hoursPreviousWeeksUntilThisDate
                      )}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {getComparisonPercentage(
                        analyticsData.weekReview.hoursThisWeek,
                        analyticsData.weekReview.hoursPreviousWeeksUntilThisDate
                      )}{" "}
                      vs Last Week
                    </motion.p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">
                      {new Date().toLocaleString("en-US", { month: "long" })}
                    </p>
                    <motion.p 
                      className="text-lg font-bold"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <animated.span>
                        {monthSummarySpring.number.to((n) => n.toFixed(1))}
                      </animated.span>h
                    </motion.p>
                    <motion.p
                      className={`text-xs ${getComparisonColor(
                        analyticsData.weekReview.monthSummary.hoursThisMonth,
                        analyticsData.weekReview.monthSummary
                          .hoursPreviousMonthUntilThisDate
                      )}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {getComparisonPercentage(
                        analyticsData.weekReview.monthSummary.hoursThisMonth,
                        analyticsData.weekReview.monthSummary
                          .hoursPreviousMonthUntilThisDate
                      )}{" "}
                      vs{" "}
                      {new Date(
                        new Date().setMonth(new Date().getMonth() - 1)
                      ).toLocaleString("en-US", { month: "long" })}
                    </motion.p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.div 
                    className="bg-gray-50 p-3 rounded-md flex-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <p className="text-xs font-medium mb-2">Previous Weeks</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs">
                          Up to{" "}
                          {new Date().toLocaleString("en-US", {
                            weekday: "long",
                          })}
                        </p>
                        <p className="text-sm font-bold">
                          <animated.span>
                            {previousWeeksUntilThisDateSpring.number.to((n) => n.toFixed(1))}
                          </animated.span>h
                        </p>
                      </div>
                      <div>
                        <p className="text-xs">Total</p>
                        <p className="text-sm font-bold">
                          <animated.span>
                            {previousWeeksSpring.number.to((n) => n.toFixed(1))}
                          </animated.span>h
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-gray-50 p-3 rounded-md flex-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <p className="text-xs font-medium mb-2">
                      {new Date(
                        new Date().setMonth(new Date().getMonth() - 1)
                      ).toLocaleString("en-US", { month: "long" })}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs">
                          Up to the {new Date().getDate()}
                          {["st", "nd", "rd"][
                            ((((new Date().getDate() + 90) % 100) - 10) % 10) -
                              1
                          ] || "th"}
                        </p>
                        <p className="text-sm font-bold">
                          <animated.span>
                            {previousMonthUntilThisDateSpring.number.to((n) => n.toFixed(1))}
                          </animated.span>h
                        </p>
                      </div>
                      <div>
                        <p className="text-xs">Total</p>
                        <p className="text-sm font-bold">
                          <animated.span>
                            {previousMonthSpring.number.to((n) => n.toFixed(1))}
                          </animated.span>h
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
        <div className="col-span-3">
          <TimelinessPanel data={analyticsData?.timelinessReview} />
        </div>
      </div>

      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2 }}>
        <Masonry gutter="1rem">
          <TopClients
            clientData={clientStatsData?.timesheet.byClient}
            selectedStat={selectedStat}
            totalHours={getSelectedStats?.totalHours || 0}
          />
          <TopSponsors
            sponsorData={clientStatsData?.timesheet.bySponsor}
            selectedStat={selectedStat}
            totalHours={getSelectedStats?.totalHours || 0}
          />
          <CasesByContractEnd
            caseData={clientStatsData?.timesheet.byCase}
            selectedStat={selectedStat}
          />
          <CasesUpdates
            caseData={clientStatsData?.timesheet.byCase}
            selectedStat={selectedStat}
          />
        </Masonry>
      </ResponsiveMasonry>
    </main>
  );
};

export default ConsultantOrEngineerHome;
