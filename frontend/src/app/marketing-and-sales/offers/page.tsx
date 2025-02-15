"use client";

import { gql, HttpLink, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/app/components/analytics/stat";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { print } from "graphql";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const GET_OFFERS = gql`
  query GetOffers {
    marketingAndSales {
      offers {
        data {
          slug
          name
          coverImageUrl
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
  }
`;

export default function ProductsOrServices() {
  const client = useEdgeClient();
  const { loading, error, data } = useQuery(GET_OFFERS, {
    client: client ?? undefined,
    ssr: true,
  });
  const [selectedStat, setSelectedStat] = useState<string>("allOffers");
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const queryString = print(GET_OFFERS);

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

  const formatHours = (hours: number): string => {
    return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
  };

  const OfferCard = ({ offer }: { offer: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const timesheetData = offer.timesheet?.summary;

    return (
      <Link
        href={`/marketing-and-sales/offers/${offer.slug}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`h-full ${
            isHovered ? "shadow-lg scale-105" : "shadow"
          } transition-all duration-300 relative overflow-hidden`}
        >
          <div className="w-full aspect-video relative">
            <Image
              src={offer.coverImageUrl}
              alt={`${offer.name} cover`}
              layout="fill"
              objectFit="cover"
              className="border-b"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          </div>
          <CardContent className="flex flex-col items-center p-4">
            <h3 className="text-center font-medium text-gray-800 mb-2 line-clamp-2">{offer.name}</h3>
            {timesheetData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {timesheetData.totalConsultingHours > 0 && (
                  <Badge variant="outline" className={`bg-amber-500/10 text-amber-500 border-amber-500/20`}>
                    {formatHours(timesheetData.totalConsultingHours)}h
                  </Badge>
                )}
                {timesheetData.totalHandsOnHours > 0 && (
                  <Badge variant="outline" className={`bg-violet-500/10 text-violet-500 border-violet-500/20`}>
                    {formatHours(timesheetData.totalHandsOnHours)}h
                  </Badge>
                )}
                {timesheetData.totalSquadHours > 0 && (
                  <Badge variant="outline" className={`bg-blue-500/10 text-blue-500 border-blue-500/20`}>
                    {formatHours(timesheetData.totalSquadHours)}h
                  </Badge>
                )}
                {timesheetData.totalInternalHours > 0 && (
                  <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>
                    {formatHours(timesheetData.totalInternalHours)}h
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  const offers = data.marketingAndSales.offers.data;
  const filteredOffers = offers
    .filter((offer: any) =>
      offer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((offer: any) => {
      const timesheetData = offer.timesheet?.summary;
      
      if (selectedStat === "allOffers") {
        return true;
      }
      
      if (!timesheetData) {
        return false;
      }

      switch (selectedStat) {
        case "total":
          return timesheetData.totalHours > 0;
        case "consulting":
          return timesheetData.totalConsultingHours > 0;
        case "handsOn":
          return timesheetData.totalHandsOnHours > 0;
        case "squad":
          return timesheetData.totalSquadHours > 0;
        case "internal":
          return timesheetData.totalInternalHours > 0;
        default:
          return true;
      }
    });

  return (
    <>
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <SectionHeader title="All Time" subtitle="" />
              <div
                className={`${getStatClassName("allOffers")} transform`}
                onClick={() => handleStatClick("allOffers")}
              >
                <Stat
                  title="All Offers"
                  value={offers.length.toString()}
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
                    title="Active Offers"
                    value={offers
                      .filter((o: any) => o.timesheet?.summary?.totalHours > 0)
                      .length.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={offers
                      .filter((o: any) => o.timesheet?.summary?.totalConsultingHours > 0)
                      .length.toString()}
                    color="#F59E0B"
                    total={offers.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={offers
                      .filter((o: any) => o.timesheet?.summary?.totalHandsOnHours > 0)
                      .length.toString()}
                    color="#8B5CF6"
                    total={offers.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={offers
                      .filter((o: any) => o.timesheet?.summary?.totalSquadHours > 0)
                      .length.toString()}
                    color="#3B82F6"
                    total={offers.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={offers
                      .filter((o: any) => o.timesheet?.summary?.totalInternalHours > 0)
                      .length.toString()}
                    color="#10B981"
                    total={offers.length}
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
          placeholder="Search offers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="px-2">
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredOffers.map((offer: any) => (
              <motion.div
                key={offer.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <OfferCard offer={offer} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
