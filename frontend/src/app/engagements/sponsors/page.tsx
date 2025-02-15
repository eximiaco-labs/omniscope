"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { gql, useQuery } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const GET_SPONSORS_AND_TIMESHEET = gql`
  query GetSponsorsAndTimesheet {
    engagements {
      sponsors {
        data {
          slug
          name
          photoUrl
          jobTitle
          linkedinUrl
          client {
            name
          }
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
      summary {
        uniqueSponsors
      }
      byKind {
        consulting {
          uniqueSponsors
        }
        handsOn {
          uniqueSponsors
        }
        squad {
          uniqueSponsors
        }
        internal {
          uniqueSponsors
        }
      }
    }
  }
`;

export default function Sponsors() {
  const client = useEdgeClient();
  const [selectedStat, setSelectedStat] = useState<string>("allSponsors");
  const [searchTerm, setSearchTerm] = useState("");

  const { loading, error, data } = useQuery(GET_SPONSORS_AND_TIMESHEET, {
    client: client ?? undefined,
    ssr: true,
  });

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

  const sponsors = data.engagements.sponsors.data;
  const filteredSponsors = sponsors
    .filter((sponsor: any) =>
      (sponsor.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (sponsor.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sponsor.jobTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .filter((sponsor: any) => {
      const sponsorData = sponsor.timesheet?.summary;
      if (!sponsorData) return selectedStat === "allSponsors";
      switch (selectedStat) {
        case "total":
          return sponsorData.totalHours > 0;
        case "consulting":
          return sponsorData.totalConsultingHours > 0;
        case "handsOn":
          return sponsorData.totalHandsOnHours > 0;
        case "squad":
          return sponsorData.totalSquadHours > 0;
        case "internal":
          return sponsorData.totalInternalHours > 0;
        default:
          return true;
      }
    });

  const SponsorCard = ({ sponsor }: { sponsor: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const sponsorData = sponsor.timesheet?.summary;

    return (
      <Link
        href={`/engagements/sponsors/${sponsor.slug}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`h-full ${
            isHovered ? "shadow-lg scale-105" : "shadow"
          } transition-all duration-300 relative`}
        >
          <CardContent className="flex flex-col items-center p-4">
            <span className="rounded-full *:rounded-full">
              <img
                alt=""
                src={sponsor.photoUrl}
                className={clsx(
                  "inline-grid shrink-0 align-middle [--avatar-radius:20%] [--ring-opacity:20%] *:col-start-1 *:row-start-1",
                  "outline outline-1 -outline-offset-1 outline-black/[--ring-opacity] dark:outline-white/[--ring-opacity]",
                  "inline-block h-16 w-16 rounded-full object-cover"
                )}
              />
            </span>
            <CardHeader className="p-0 mt-2">
              <CardTitle
                className={`text-center text-sm ${
                  isHovered ? "font-semibold" : ""
                } transition-all duration-300`}
              >
                {sponsor.name}
              </CardTitle>
            </CardHeader>
            <div className="text-xs text-center text-zinc-500 mt-1">
              {sponsor.jobTitle}
            </div>
            {sponsor.client && (
              <div className="text-xs text-center text-zinc-500 mt-1">
                {sponsor.client.name}
              </div>
            )}
            {sponsorData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {sponsorData.totalConsultingHours > 0 && (
                  <Badge variant="outline" className={`bg-amber-500/10 text-amber-500 border-amber-500/20`}>
                    {sponsorData.totalConsultingHours.toFixed(1).replace(/\.0$/, "")}h
                  </Badge>
                )}
                {sponsorData.totalHandsOnHours > 0 && (
                  <Badge variant="outline" className={`bg-violet-500/10 text-violet-500 border-violet-500/20`}>
                    {sponsorData.totalHandsOnHours.toFixed(1).replace(/\.0$/, "")}h
                  </Badge>
                )}
                {sponsorData.totalSquadHours > 0 && (
                  <Badge variant="outline" className={`bg-blue-500/10 text-blue-500 border-blue-500/20`}>
                    {sponsorData.totalSquadHours.toFixed(1).replace(/\.0$/, "")}h
                  </Badge>
                )}
                {sponsorData.totalInternalHours > 0 && (
                  <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>
                    {sponsorData.totalInternalHours.toFixed(1).replace(/\.0$/, "")}h
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
                className={`${getStatClassName("allSponsors")} transform`}
                onClick={() => handleStatClick("allSponsors")}
              >
                <Stat
                  title="All Sponsors"
                  value={sponsors.length.toString()}
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
                    title="Active Sponsors"
                    value={data.timesheet.summary.uniqueSponsors.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={data.timesheet.byKind.consulting.uniqueSponsors.toString()}
                    color="#F59E0B"
                    total={data.timesheet.summary.uniqueSponsors}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={data.timesheet.byKind.handsOn.uniqueSponsors.toString()}
                    color="#8B5CF6"
                    total={data.timesheet.summary.uniqueSponsors}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={data.timesheet.byKind.squad.uniqueSponsors.toString()}
                    color="#3B82F6"
                    total={data.timesheet.summary.uniqueSponsors}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={data.timesheet.byKind.internal.uniqueSponsors.toString()}
                    color="#10B981"
                    total={data.timesheet.summary.uniqueSponsors}
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
          placeholder="Search sponsors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="px-2">
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredSponsors.map((sponsor: any) => (
              <motion.div
                key={sponsor.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <SponsorCard sponsor={sponsor} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
