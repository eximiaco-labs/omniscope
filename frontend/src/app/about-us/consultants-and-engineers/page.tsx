"use client";

import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { WorkerCard } from "./WorkerCard";

const GET_CONSULTANTS_AND_TIMESHEET = gql`
  query GetConsultantsAndTimesheet {
    consultantsAndEngineers {
      slug
      name
      email
      position
      photoUrl
      errors
      isRecognized
      isOntologyAuthor
      isInsightsAuthor
      isTimeTrackerWorker
      isSpecialProjectsWorker
    }
    timesheet(slug: "last-six-weeks", kind: ALL) {
      uniqueWorkers
      byKind {
        consulting {
          uniqueWorkers
        }
        handsOn {
          uniqueWorkers
        }
        squad {
          uniqueWorkers
        }
        internal {
          uniqueWorkers
        }
      }
      byWorker {
        name
        totalHours
        totalConsultingHours
        totalHandsOnHours
        totalSquadHours
        totalInternalHours
      }
    }
  }
`;

interface TimesheetWorker {
  name: string;
  totalHours: number;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
}

interface ConsultantEngineer {
  slug: string;
  name: string;
  email: string;
  position: string;
  photoUrl: string;
  errors: any;
  isRecognized: boolean;
  isOntologyAuthor: boolean;
  isInsightsAuthor: boolean;
  isTimeTrackerWorker: boolean;
  isSpecialProjectsWorker: boolean;
}

interface TimesheetData {
  uniqueWorkers: number;
  byKind: {
    consulting: { uniqueWorkers: number };
    handsOn: { uniqueWorkers: number };
    squad: { uniqueWorkers: number };
    internal: { uniqueWorkers: number };
  };
  byWorker: TimesheetWorker[];
}

interface QueryData {
  consultantsAndEngineers: ConsultantEngineer[];
  timesheet: TimesheetData;
}

export default function ConsultantsAndEngineers() {
  const { loading, error, data } = useQuery<QueryData>(
    GET_CONSULTANTS_AND_TIMESHEET,
    { ssr: true }
  );
  const [selectedStat, setSelectedStat] = useState<string>("allWorkers");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName
        ? "ring-2 ring-black shadow-lg scale-105"
        : "hover:scale-102"
    }`;
  };

  const filteredWorkers = data.consultantsAndEngineers.filter((worker) => {
    const workerData = data.timesheet.byWorker.find(
      (w) => w.name === worker.name
    );
    if (!workerData) return selectedStat === "allWorkers";

    switch (selectedStat) {
      case "total":
        return workerData.totalHours > 0;
      case "consulting":
        return workerData.totalConsultingHours > 0;
      case "handsOn":
        return workerData.totalHandsOnHours > 0;
      case "squad":
        return workerData.totalSquadHours > 0;
      case "internal":
        return workerData.totalInternalHours > 0;
      default:
        return true;
    }
  });

  return (
    <>
      <div className="grid grid-cols-6 gap-4 mb-8">
        <div className="col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-3">
                <p className="text-sm font-semibold text-gray-900 uppercase">
                  ALL TIME
                </p>
                <div className="flex-grow h-px bg-gray-200 ml-2"></div>
              </div>
              <div
                className={`${getStatClassName("allWorkers")} transform`}
                onClick={() => handleStatClick("allWorkers")}
              >
                <Stat
                  title="All Workers"
                  value={data.consultantsAndEngineers.length.toString()}
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="flex items-center mb-3">
                <p className="text-sm font-semibold text-gray-900 uppercase">
                  ACTIVE{" "}
                  <span className="text-xs text-gray-600 uppercase">
                    LAST SIX WEEKS
                  </span>
                </p>
                <div className="flex-grow h-px bg-gray-200 ml-2"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div
                  className={`${getStatClassName("total")} transform`}
                  onClick={() => handleStatClick("total")}
                >
                  <Stat
                    title="Active Workers"
                    value={data.timesheet.uniqueWorkers.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={data.timesheet.byKind.consulting.uniqueWorkers.toString()}
                    color="#F59E0B"
                    total={data.timesheet.uniqueWorkers}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={data.timesheet.byKind.handsOn.uniqueWorkers.toString()}
                    color="#8B5CF6"
                    total={data.timesheet.uniqueWorkers}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={data.timesheet.byKind.squad.uniqueWorkers.toString()}
                    color="#3B82F6"
                    total={data.timesheet.uniqueWorkers}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={data.timesheet.byKind.internal.uniqueWorkers.toString()}
                    color="#10B981"
                    total={data.timesheet.uniqueWorkers}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider className="my-8" />
      <AnimatePresence>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {filteredWorkers.map((worker) => (
            <motion.div
              key={worker.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <WorkerCard
                worker={worker}
                workerData={data.timesheet.byWorker.find(
                  (w) => w.name === worker.name
                )}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
</>
  );
}
