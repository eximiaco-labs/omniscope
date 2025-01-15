"use client";

import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { gql, useQuery } from "@apollo/client";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import { Stat } from "@/app/components/analytics/stat";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const GET_ACCOUNT_MANAGERS_AND_TIMESHEET = gql`
  query GetAccountManagersAndTimesheet {
    team {
      accountManagers {
        data {
          slug
          name
          email
          position
          photoUrl
          isRecognized
          errors
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
        consulting { uniqueAccountManagers }
        handsOn { uniqueAccountManagers }
        squad { uniqueAccountManagers }
        internal { uniqueAccountManagers }
      }
    }
  }
`;

export default function AccountManagers() {
  const client = useEdgeClient();
  
  if (!client) return <p>Loading client...</p>;
  
  const { loading, error, data } = useQuery(
    GET_ACCOUNT_MANAGERS_AND_TIMESHEET,
    { 
      client,
      ssr: true 
    }
  );
  const [selectedStat, setSelectedStat] = useState<string>("allAccountManagers");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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

  const filteredAccountManagers = data.team.accountManagers.data.filter(
    (manager: any) => {
      const managerData = manager.timesheet?.summary;
      if (!managerData) return selectedStat === "allAccountManagers";
      switch (selectedStat) {
        case "total":
          return managerData.totalHours > 0;
        case "consulting":
          return managerData.totalConsultingHours > 0;
        case "handsOn":
          return managerData.totalHandsOnHours > 0;
        case "squad":
          return managerData.totalSquadHours > 0;
        case "internal":
          return managerData.totalInternalHours > 0;
        default:
          return true;
      }
    }
  );

  const AccountManagerCard = ({ manager }: { manager: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const managerData = manager.timesheet?.summary;

    return (
      <Link
        href={`/about-us/account-managers/${encodeURIComponent(manager.slug)}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`h-full ${
            isHovered ? "shadow-lg scale-105" : "shadow"
          } transition-all duration-300`}
        >
          {(!manager.isRecognized ||
            !manager.email ||
            (manager.email &&
              !manager.email.endsWith("@elemarjr.com") &&
              !manager.email.endsWith("@eximia.co") &&
              !manager.email.endsWith("@eximia.com"))) && (
            <div className="absolute -top-2 -left-2 z-10">
              <div className="bg-red-500 rounded-full p-1">
                <AlertTriangle className="text-white" size={20} />
              </div>
            </div>
          )}
          <CardContent className="flex flex-col items-center p-4">
            <Avatar className="size-16 mb-2">
              <AvatarImage src={manager.photoUrl} alt={manager.name} />
            </Avatar>
            <CardHeader className="p-0 mt-2">
              <CardTitle
                className={`text-center text-sm ${
                  isHovered ? "font-semibold" : ""
                } transition-all duration-300`}
              >
                {manager.name}
              </CardTitle>
            </CardHeader>
            <div className="text-xs text-center mt-1 flex items-center justify-center">
              {manager.email ? (
                <>
                  <Mail className="mr-1" size={12} />
                  <span
                    className={
                      manager.email.endsWith("@eximia.co") ||
                      manager.email.endsWith("@elemarjr.com")
                        ? "text-zinc-700"
                        : "text-red-500"
                    }
                  >
                    {manager.email}
                  </span>
                </>
              ) : (
                <Mail className="text-red-500" size={12} />
              )}
            </div>
            <div className="text-xs text-center text-zinc-500 mt-1">
              {manager.position
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")}
            </div>
            {manager.errors.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center">
                {manager.errors.map((error: string) => (
                  <Badge key={error} variant="destructive" className="text-xs m-1">
                    {error}
                  </Badge>
                ))}
              </div>
            )}
            {managerData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {managerData.totalConsultingHours > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    {managerData.totalConsultingHours
                      .toFixed(1)
                      .replace(/\.0$/, "")}
                    h
                  </Badge>
                )}
                {managerData.totalHandsOnHours > 0 && (
                  <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/20">
                    {managerData.totalHandsOnHours
                      .toFixed(1)
                      .replace(/\.0$/, "")}
                    h
                  </Badge>
                )}
                {managerData.totalSquadHours > 0 && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {managerData.totalSquadHours.toFixed(1).replace(/\.0$/, "")}
                    h
                  </Badge>
                )}
                {managerData.totalInternalHours > 0 && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    {managerData.totalInternalHours
                      .toFixed(1)
                      .replace(/\.0$/, "")}
                    h
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
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <SectionHeader title="All Time" subtitle="" />
              <div
                className={`${getStatClassName(
                  "allAccountManagers"
                )} transform`}
                onClick={() => handleStatClick("allAccountManagers")}
              >
                <Stat
                  title="All Managers"
                  value={data.team.accountManagers.data.length.toString()}
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
                    title="Active Managers"
                    value={data.team.accountManagers.data.filter(
                      (manager: any) => {
                        const summary = manager.timesheet?.summary;
                        return summary && (
                          summary.totalConsultingHours > 0 ||
                          summary.totalHandsOnHours > 0 ||
                          summary.totalSquadHours > 0 ||
                          summary.totalInternalHours > 0
                        );
                      }
                    ).length.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={data.timesheet.byKind.consulting.uniqueAccountManagers.toString()}
                    color="#F59E0B"
                    total={data.team.accountManagers.data.filter(
                      (manager: any) => {
                        const summary = manager.timesheet?.summary;
                        return summary && (
                          summary.totalConsultingHours > 0 ||
                          summary.totalHandsOnHours > 0 ||
                          summary.totalSquadHours > 0 ||
                          summary.totalInternalHours > 0
                        );
                      }
                    ).length}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={data.timesheet.byKind.handsOn.uniqueAccountManagers.toString()}
                    color="#8B5CF6"
                    total={data.team.accountManagers.data.filter(
                      (manager: any) => {
                        const summary = manager.timesheet?.summary;
                        return summary && (
                          summary.totalConsultingHours > 0 ||
                          summary.totalHandsOnHours > 0 ||
                          summary.totalSquadHours > 0 ||
                          summary.totalInternalHours > 0
                        );
                      }
                    ).length}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={data.timesheet.byKind.squad.uniqueAccountManagers.toString()}
                    color="#3B82F6"
                    total={data.team.accountManagers.data.filter(
                      (manager: any) => {
                        const summary = manager.timesheet?.summary;
                        return summary && (
                          summary.totalConsultingHours > 0 ||
                          summary.totalHandsOnHours > 0 ||
                          summary.totalSquadHours > 0 ||
                          summary.totalInternalHours > 0
                        );
                      }
                    ).length}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={data.timesheet.byKind.internal.uniqueAccountManagers.toString()}
                    color="#10B981"
                    total={data.team.accountManagers.data.filter(
                      (manager: any) => {
                        const summary = manager.timesheet?.summary;
                        return summary && (
                          summary.totalConsultingHours > 0 ||
                          summary.totalHandsOnHours > 0 ||
                          summary.totalSquadHours > 0 ||
                          summary.totalInternalHours > 0
                        );
                      }
                    ).length}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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