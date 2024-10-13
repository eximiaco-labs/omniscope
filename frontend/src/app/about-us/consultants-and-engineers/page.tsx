"use client";

import { useState } from "react";
import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@/components/catalyst/button";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const GET_CONSULTANTS_AND_TIMESHEET = gql`
  query GetConsultantsAndTimesheet {
    consultantsAndEngineers {
      slug
      name
      position
      photoUrl
      errors
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

export default function ConsultantsAndEngineers() {
  const { loading, error, data } = useQuery(GET_CONSULTANTS_AND_TIMESHEET, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>('allWorkers');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const filteredWorkers = data.consultantsAndEngineers.filter((worker: any) => {
    const workerData = data.timesheet.byWorker.find((w: any) => w.name === worker.name);
    if (!workerData) return selectedStat === 'allWorkers';
    switch (selectedStat) {
      case 'total':
        return workerData.totalHours > 0;
      case 'consulting':
        return workerData.totalConsultingHours > 0;
      case 'handsOn':
        return workerData.totalHandsOnHours > 0;
      case 'squad':
        return workerData.totalSquadHours > 0;
      case 'internal':
        return workerData.totalInternalHours > 0;
      default:
        return true;
    }
  });

  const WorkerCard = ({ worker }: { worker: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const workerData = data.timesheet.byWorker.find((w: any) => w.name === worker.name);

    const getBadgeColor = (type: string) => {
      switch (type) {
        case 'consulting': return 'amber';
        case 'handsOn': return 'purple';
        case 'squad': return 'blue';
        case 'internal': return 'emerald';
        default: return 'zinc';
      }
    };

    return (
      <Link 
        href={`/analytics/datasets/timesheet-this-month?WorkerName=${encodeURIComponent(worker.name)}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300`}>
          <CardContent className="flex flex-col items-center p-4">
            <Avatar src={worker.photoUrl} className="size-16 mb-2" />
            <CardHeader className="p-0 mt-2">
              <CardTitle className={`text-center text-sm ${isHovered ? 'font-semibold' : ''} transition-all duration-300`}>
                {worker.name}
              </CardTitle>
            </CardHeader>
            <div className="text-xs text-center text-zinc-500 mt-1">
              {worker.position.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
            </div>
            {worker.errors.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center">
                {worker.errors.map((error: string) => (
                  <Badge key={error} color='rose' className="text-xs m-1">
                    {error}
                  </Badge>
                ))}
              </div>
            )}
            {workerData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {workerData.totalConsultingHours > 0 && (
                  <Badge color={getBadgeColor('consulting')}>
                    {workerData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {workerData.totalHandsOnHours > 0 && (
                  <Badge color={getBadgeColor('handsOn')}>
                    {workerData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {workerData.totalSquadHours > 0 && (
                  <Badge color={getBadgeColor('squad')}>
                    {workerData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {workerData.totalInternalHours > 0 && (
                  <Badge color={getBadgeColor('internal')}>
                    {workerData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Consultants & Engineers</Heading>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                  className={`${getStatClassName('allWorkers')} transform`}
                  onClick={() => handleStatClick('allWorkers')}
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
                    ACTIVE <span className="text-xs text-gray-600 uppercase">LAST SIX WEEKS</span>
                  </p>
                  <div className="flex-grow h-px bg-gray-200 ml-2"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div
                    className={`${getStatClassName('total')} transform`}
                    onClick={() => handleStatClick('total')}
                  >
                    <Stat
                      title="Active Workers"
                      value={data.timesheet.uniqueWorkers.toString()}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('consulting')} transform`}
                    onClick={() => handleStatClick('consulting')}
                  >
                    <Stat
                      title="Consulting"
                      value={data.timesheet.byKind.consulting.uniqueWorkers.toString()}
                      color="#F59E0B"
                      total={data.timesheet.uniqueWorkers}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('handsOn')} transform`}
                    onClick={() => handleStatClick('handsOn')}
                  >
                    <Stat
                      title="Hands-On"
                      value={data.timesheet.byKind.handsOn.uniqueWorkers.toString()}
                      color="#8B5CF6"
                      total={data.timesheet.uniqueWorkers}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('squad')} transform`}
                    onClick={() => handleStatClick('squad')}
                  >
                    <Stat
                      title="Squad"
                      value={data.timesheet.byKind.squad.uniqueWorkers.toString()}
                      color="#3B82F6"
                      total={data.timesheet.uniqueWorkers}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('internal')} transform`}
                    onClick={() => handleStatClick('internal')}
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
            {filteredWorkers.map((worker: any) => (
              <motion.div
                key={worker.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <WorkerCard worker={worker} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
