"use client";

import { useState } from "react";
import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const GET_ACCOUNT_MANAGERS_AND_TIMESHEET = gql`
  query GetAccountManagersAndTimesheet {
    accountManagers {
      slug
      name
      position
      photoUrl
      errors
    }
    timesheet(slug: "last-six-weeks", kind: ALL) {
      uniqueAccountManagers
      byKind {
        consulting {
          uniqueAccountManagers
        }
        handsOn {
          uniqueAccountManagers
        }
        squad {
          uniqueAccountManagers
        }
        internal {
          uniqueAccountManagers
        }
      }
      byAccountManager {
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

export default function AccountManagers() {
  const { loading, error, data } = useQuery(GET_ACCOUNT_MANAGERS_AND_TIMESHEET, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>('allAccountManagers');

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

  const filteredAccountManagers = data.accountManagers.filter((manager: any) => {
    const managerData = data.timesheet.byAccountManager.find((m: any) => m.name === manager.name);
    if (!managerData) return selectedStat === 'allAccountManagers';
    switch (selectedStat) {
      case 'total':
        return managerData.totalHours > 0;
      case 'consulting':
        return managerData.totalConsultingHours > 0;
      case 'handsOn':
        return managerData.totalHandsOnHours > 0;
      case 'squad':
        return managerData.totalSquadHours > 0;
      case 'internal':
        return managerData.totalInternalHours > 0;
      default:
        return true;
    }
  });

  const AccountManagerCard = ({ manager }: { manager: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const managerData = data.timesheet.byAccountManager.find((m: any) => m.name === manager.name);

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
        href={`/analytics/datasets/timesheet-this-month?AccountManagerName=${encodeURIComponent(manager.name)}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300`}>
          <CardContent className="flex flex-col items-center p-4">
            <Avatar src={manager.photoUrl} className="size-16 mb-2" />
            <CardHeader className="p-0 mt-2">
              <CardTitle className={`text-center text-sm ${isHovered ? 'font-semibold' : ''} transition-all duration-300`}>
                {manager.name}
              </CardTitle>
            </CardHeader>
            <div className="text-xs text-center text-zinc-500 mt-1">
              {manager.position.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
            </div>
            {manager.errors.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center">
                {manager.errors.map((error: string) => (
                  <Badge key={error} color='rose' className="text-xs m-1">
                    {error}
                  </Badge>
                ))}
              </div>
            )}
            {managerData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {managerData.totalConsultingHours > 0 && (
                  <Badge color={getBadgeColor('consulting')}>
                    {managerData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {managerData.totalHandsOnHours > 0 && (
                  <Badge color={getBadgeColor('handsOn')}>
                    {managerData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {managerData.totalSquadHours > 0 && (
                  <Badge color={getBadgeColor('squad')}>
                    {managerData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {managerData.totalInternalHours > 0 && (
                  <Badge color={getBadgeColor('internal')}>
                    {managerData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
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
        <Heading>Account Managers</Heading>
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
                  className={`${getStatClassName('allAccountManagers')} transform`}
                  onClick={() => handleStatClick('allAccountManagers')}
                >
                  <Stat
                    title="All Managers"
                    value={data.accountManagers.length.toString()}
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
                      title="Active Managers"
                      value={data.timesheet.uniqueAccountManagers.toString()}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('consulting')} transform`}
                    onClick={() => handleStatClick('consulting')}
                  >
                    <Stat
                      title="Consulting"
                      value={data.timesheet.byKind.consulting.uniqueAccountManagers.toString()}
                      color="#F59E0B"
                      total={data.timesheet.uniqueAccountManagers}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('handsOn')} transform`}
                    onClick={() => handleStatClick('handsOn')}
                  >
                    <Stat
                      title="Hands-On"
                      value={data.timesheet.byKind.handsOn.uniqueAccountManagers.toString()}
                      color="#8B5CF6"
                      total={data.timesheet.uniqueAccountManagers}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('squad')} transform`}
                    onClick={() => handleStatClick('squad')}
                  >
                    <Stat
                      title="Squad"
                      value={data.timesheet.byKind.squad.uniqueAccountManagers.toString()}
                      color="#3B82F6"
                      total={data.timesheet.uniqueAccountManagers}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('internal')} transform`}
                    onClick={() => handleStatClick('internal')}
                  >
                    <Stat
                      title="Internal"
                      value={data.timesheet.byKind.internal.uniqueAccountManagers.toString()}
                      color="#10B981"
                      total={data.timesheet.uniqueAccountManagers}
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
            {filteredAccountManagers.map((manager: any) => (
              <motion.div
                key={manager.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AccountManagerCard manager={manager} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}