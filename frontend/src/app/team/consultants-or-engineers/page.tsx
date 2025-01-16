"use client";

import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { motion, AnimatePresence } from "framer-motion";
import { WorkerCard } from "./WorkerCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const GET_CONSULTANTS_AND_TIMESHEET = gql`
  query GetConsultantsAndTimesheet {
    team {
      consultantsOrEngineers {
        data {
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
          timesheet(slug: "last-six-weeks") {
            summary {
              totalHours
              totalConsultingHours
              totalHandsOnHours
              totalSquadHours
              totalInternalHours
            }
          }
        }
      }
    }
    timesheet(slug: "last-six-weeks") {
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
    }
  }
`;

interface TimesheetSummary {
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
  timesheet?: {
    summary: TimesheetSummary;
  };
}

interface TimesheetData {
  byKind: {
    consulting: { uniqueWorkers: number };
    handsOn: { uniqueWorkers: number };
    squad: { uniqueWorkers: number };
    internal: { uniqueWorkers: number };
  };
}

interface QueryData {
  team: {
    consultantsOrEngineers: {
      data: ConsultantEngineer[];
    };
  };
  timesheet: TimesheetData;
}

export default function ConsultantsAndEngineers() {
  const client = useEdgeClient();
  
  if (!client) return <p>Loading client...</p>;
  
  const { loading, error, data } = useQuery<QueryData>(
    GET_CONSULTANTS_AND_TIMESHEET,
    { 
      client,
      ssr: true 
    }
  );
  const [selectedStat, setSelectedStat] = useState<string>("allWorkers");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredWorkers = data.team.consultantsOrEngineers.data
    .filter((worker) => 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((worker) => {
      const summary = worker.timesheet?.summary;
      if (!summary) return selectedStat === "allWorkers";

      switch (selectedStat) {
        case "total":
          return summary.totalHours > 0;
        case "consulting":
          return summary.totalConsultingHours > 0;
        case "handsOn":
          return summary.totalHandsOnHours > 0;
        case "squad":
          return summary.totalSquadHours > 0;
        case "internal":
          return summary.totalInternalHours > 0;
        default:
          return true;
      }
    });

  const getActiveWorkersCount = () => {
    return data.team.consultantsOrEngineers.data.filter(
      worker => worker.timesheet?.summary && worker.timesheet.summary.totalHours > 0
    ).length;
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <SectionHeader title="All Time" subtitle="" />
              <div
                className={`${getStatClassName("allWorkers")} transform`}
                onClick={() => handleStatClick("allWorkers")}
              >
                <Stat
                  title="All Workers"
                  value={data.team.consultantsOrEngineers.data.length.toString()}
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <SectionHeader title="Active" subtitle="Last Six Weeks" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div
                  className={`${getStatClassName("total")} transform`}
                  onClick={() => handleStatClick("total")}
                >
                  <Stat
                    title="Active Workers"
                    value={getActiveWorkersCount().toString()}
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
                    total={getActiveWorkersCount()}
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
                    total={getActiveWorkersCount()}
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
                    total={getActiveWorkersCount()}
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
                    total={getActiveWorkersCount()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search workers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="px-2">
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 space-y-3"
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
                  workerData={worker.timesheet?.summary}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
