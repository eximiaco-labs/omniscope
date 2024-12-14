"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, HttpLink, useQuery, useMutation } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/catalyst/badge";
import { print } from "graphql";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const GET_OFFERS_AND_TIMESHEET = gql`
  query GetOffersAndTimesheet {
    offers {
      id
      slug
      name
      coverImageUrl
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
      byOffer {
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

export default function ProductsOrServices() {
  const { loading, error, data, refetch } = useQuery(GET_OFFERS_AND_TIMESHEET, {
    ssr: true,
  });
  const { data: cacheData } = useQuery(GET_CACHE_QUERY);
  const [invalidateCache] = useMutation(INVALIDATE_CACHE_MUTATION);
  const [selectedStat, setSelectedStat] = useState<string>("allOffers");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const queryString = print(GET_OFFERS_AND_TIMESHEET);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateCache({ variables: { key: "offers" } });
      const { data: newData } = await refetch();
      if (newData) {
        window.location.reload();
        toast.success("Offers data refreshed successfully");
      }
    } catch (err) {
      toast.error("Failed to refresh offers data");
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

  const OfferCard = ({ offer }: { offer: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const offerData = data.timesheet.byOffer.find(
      (o: any) => o.name === offer.name
    );

    const getBadgeColor = (type: string) => {
      switch (type) {
        case "consulting":
          return "amber";
        case "handsOn":
          return "purple";
        case "squad":
          return "blue";
        case "internal":
          return "emerald";
        default:
          return "zinc";
      }
    };

    return (
      <Link
        href={`/analytics/datasets/timesheet-last-six-weeks?OfferName=${encodeURIComponent(
          offer.name
        )}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`h-full ${
            isHovered ? "shadow-lg scale-105" : "shadow"
          } transition-all duration-300`}
        >
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-full h-32 relative mb-2">
              <Image
                src={offer.coverImageUrl}
                alt={`${offer.name} cover`}
                layout="fill"
                objectFit="cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
            <CardHeader className="p-0 mt-2">
              <CardTitle
                className={`text-center text-sm ${
                  isHovered ? "font-semibold" : ""
                } transition-all duration-300`}
              >
                {offer.name}
              </CardTitle>
            </CardHeader>
            {offerData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {offerData.totalConsultingHours > 0 && (
                  <Badge color={getBadgeColor("consulting")}>
                    {offerData.totalConsultingHours
                      .toFixed(1)
                      .replace(/\.0$/, "")}
                    h
                  </Badge>
                )}
                {offerData.totalHandsOnHours > 0 && (
                  <Badge color={getBadgeColor("handsOn")}>
                    {offerData.totalHandsOnHours.toFixed(1).replace(/\.0$/, "")}
                    h
                  </Badge>
                )}
                {offerData.totalSquadHours > 0 && (
                  <Badge color={getBadgeColor("squad")}>
                    {offerData.totalSquadHours.toFixed(1).replace(/\.0$/, "")}h
                  </Badge>
                )}
                {offerData.totalInternalHours > 0 && (
                  <Badge color={getBadgeColor("internal")}>
                    {offerData.totalInternalHours
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

  const filteredOffers = data.offers
    .filter((offer: any) =>
      offer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((offer: any) => {
      const offerData = data.timesheet.byOffer.find(
        (o: any) => o.name === offer.name
      );
      if (!offerData) return selectedStat === "allOffers";
      switch (selectedStat) {
        case "total":
          return offerData.totalHours > 0;
        case "consulting":
          return offerData.totalConsultingHours > 0;
        case "handsOn":
          return offerData.totalHandsOnHours > 0;
        case "squad":
          return offerData.totalSquadHours > 0;
        case "internal":
          return offerData.totalInternalHours > 0;
        default:
          return true;
      }
    });

  const offersCacheInfo = cacheData?.cache?.find((item: { key: string; }) => item.key === "offers");
  
  const formatLastUpdated = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo'
    });
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2 py-1 text-xs text-muted-foreground">
        <span>Last updated: {formatLastUpdated(offersCacheInfo?.createdAt)}</span>
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
                className={`${getStatClassName("allOffers")} transform`}
                onClick={() => handleStatClick("allOffers")}
              >
                <Stat
                  title="All Offers"
                  value={data.offers.length.toString()}
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
                    value={data.timesheet.byOffer.length.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={data.timesheet.byOffer
                      .filter((o: any) => o.totalConsultingHours > 0)
                      .length.toString()}
                    color="#F59E0B"
                    total={data.timesheet.byOffer.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={data.timesheet.byOffer
                      .filter((o: any) => o.totalHandsOnHours > 0)
                      .length.toString()}
                    color="#8B5CF6"
                    total={data.timesheet.byOffer.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={data.timesheet.byOffer
                      .filter((o: any) => o.totalSquadHours > 0)
                      .length.toString()}
                    color="#3B82F6"
                    total={data.timesheet.byOffer.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={data.timesheet.byOffer
                      .filter((o: any) => o.totalInternalHours > 0)
                      .length.toString()}
                    color="#10B981"
                    total={data.timesheet.byOffer.length}
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
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 space-y-3"
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
