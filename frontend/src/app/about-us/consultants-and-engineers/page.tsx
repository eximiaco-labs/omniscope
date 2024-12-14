"use client";

import { useState } from "react";
import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { WorkerCard } from "./WorkerCard";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const INVALIDATE_CACHE_MUTATION = gql`
  mutation InvalidateCache($key: String!) {
    invalidateCache(key: $key)
  }
`;

const GET_CACHE_QUERY = gql`
  query GetCache {
    cache {
      key
      createdAt
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
  const { loading, error, data, refetch } = useQuery<QueryData>(
    GET_CONSULTANTS_AND_TIMESHEET,
    { ssr: true }
  );
  const { data: cacheData } = useQuery(GET_CACHE_QUERY);
  const [invalidateCache] = useMutation(INVALIDATE_CACHE_MUTATION);
  const [selectedStat, setSelectedStat] = useState<string>("allWorkers");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateCache({ variables: { key: "workers" } });
      const { data: newData } = await refetch();
      if (newData) {
        window.location.reload();
        toast.success("Worker data refreshed successfully");
      }
    } catch (err) {
      toast.error("Failed to refresh worker data");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

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

  const filteredWorkers = data.consultantsAndEngineers
    .filter((worker) => 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((worker) => {
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

  const workersCacheInfo = cacheData?.cache?.find((item: { key: string; }) => item.key === "workers");
  
  const formatLastUpdated = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    // Adjust for GMT-3
    // date.setHours(date.getHours() - 3);
    return date.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo'
    });
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2 py-1 text-xs text-muted-foreground">
        <span>Last updated: {formatLastUpdated(workersCacheInfo?.createdAt)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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
                  value={data.consultantsAndEngineers.length.toString()}
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
                  workerData={data.timesheet.byWorker.find(
                    (w) => w.name === worker.name
                  )}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
