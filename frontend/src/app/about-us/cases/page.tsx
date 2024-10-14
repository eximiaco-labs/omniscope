"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/catalyst/badge";
import { print } from 'graphql';
import { client } from '@/app/layout';

const GET_CASES_AND_TIMESHEET = gql`
  query GetCasesAndTimesheet {
    cases(onlyActives: true) {
      id
      slug
      title
      isActive
      sponsor
      client {
        name
      }
    }
    timesheet(slug: "last-six-weeks", kind: ALL) {
      uniqueClients
      byKind {
        consulting {
          uniqueClients
        }
        handsOn {
          uniqueClients
        }
        squad {
          uniqueClients
        }
        internal {
          uniqueClients
        }
      }
      byCase {
        title
        totalHours
        totalConsultingHours
        totalHandsOnHours
        totalSquadHours
        totalInternalHours
      }
    }
  }
`;

export default function Cases() {
  const { loading, error, data } = useQuery(GET_CASES_AND_TIMESHEET, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>('allCases');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const queryString = print(GET_CASES_AND_TIMESHEET);
  const GRAPHQL_ENDPOINT = (client.link.options as any).uri;

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const CaseCard = ({ caseItem }: { caseItem: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const caseData = data.timesheet.byCase.find((c: any) => c.title === caseItem.title);

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
        href={`/analytics/datasets/timesheet-last-six-weeks?CaseTitle=${encodeURIComponent(caseItem.title)}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300`}>
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-full mb-2 text-center">
              <h3 className="font-bold uppercase">{caseItem.client?.name || 'Unknown Client'}</h3>
              {caseItem.sponsor && (
                <div className="text-xs text-gray-600 mt-1">
                  {caseItem.sponsor}
                </div>
              )}
            </div>
            <CardHeader className="p-0 mt-2">
              <CardTitle className={`text-center text-sm transition-all duration-300`}>
                {caseItem.title}
              </CardTitle>
            </CardHeader>
            {caseData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {caseData.totalConsultingHours > 0 && (
                  <Badge color={getBadgeColor('consulting')}>
                    {caseData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {caseData.totalHandsOnHours > 0 && (
                  <Badge color={getBadgeColor('handsOn')}>
                    {caseData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {caseData.totalSquadHours > 0 && (
                  <Badge color={getBadgeColor('squad')}>
                    {caseData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {caseData.totalInternalHours > 0 && (
                  <Badge color={getBadgeColor('internal')}>
                    {caseData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  const filteredCases = data.cases.filter((caseItem: any) => {
    const caseData = data.timesheet.byCase.find((c: any) => c.title === caseItem.title);
    if (!caseData) return selectedStat === 'allCases';
    switch (selectedStat) {
      case 'total':
        return caseData.totalHours > 0;
      case 'consulting':
        return caseData.totalConsultingHours > 0;
      case 'handsOn':
        return caseData.totalHandsOnHours > 0;
      case 'squad':
        return caseData.totalSquadHours > 0;
      case 'internal':
        return caseData.totalInternalHours > 0;
      default:
        return true;
    }
  });

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading className="text-3xl font-bold text-gray-900">Cases</Heading>
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
                  className={`${getStatClassName('allCases')} transform`}
                  onClick={() => handleStatClick('allCases')}
                >
                  <Stat
                    title="All Cases"
                    value={data.cases.length.toString()}
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
                      title="Active Cases"
                      value={data.timesheet.byCase.length.toString()}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('consulting')} transform`}
                    onClick={() => handleStatClick('consulting')}
                  >
                    <Stat
                      title="Consulting"
                      value={data.timesheet.byCase.filter((c: any) => c.totalConsultingHours > 0).length.toString()}
                      color="#F59E0B"
                      total={data.timesheet.byCase.length}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('handsOn')} transform`}
                    onClick={() => handleStatClick('handsOn')}
                  >
                    <Stat
                      title="Hands-On"
                      value={data.timesheet.byCase.filter((c: any) => c.totalHandsOnHours > 0).length.toString()}
                      color="#8B5CF6"
                      total={data.timesheet.byCase.length}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('squad')} transform`}
                    onClick={() => handleStatClick('squad')}
                  >
                    <Stat
                      title="Squad"
                      value={data.timesheet.byCase.filter((c: any) => c.totalSquadHours > 0).length.toString()}
                      color="#3B82F6"
                      total={data.timesheet.byCase.length}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('internal')} transform`}
                    onClick={() => handleStatClick('internal')}
                  >
                    <Stat
                      title="Internal"
                      value={data.timesheet.byCase.filter((c: any) => c.totalInternalHours > 0).length.toString()}
                      color="#10B981"
                      total={data.timesheet.byCase.length}
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
            {filteredCases.map((caseItem: any) => (
              <motion.div
                key={caseItem.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CaseCard caseItem={caseItem} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}