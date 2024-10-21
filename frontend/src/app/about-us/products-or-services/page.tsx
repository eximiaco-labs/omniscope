"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, HttpLink, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/catalyst/badge";
import { print } from 'graphql';
import { client } from '@/app/layout';

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
  const { loading, error, data } = useQuery(GET_OFFERS_AND_TIMESHEET, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>('allOffers');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const queryString = print(GET_OFFERS_AND_TIMESHEET);
  const GRAPHQL_ENDPOINT = client.link instanceof HttpLink ? client.link.options.uri : undefined;

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const OfferCard = ({ offer }: { offer: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const offerData = data.timesheet.byOffer.find((o: any) => o.name === offer.name);

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
        href={`/analytics/datasets/timesheet-last-six-weeks?OfferName=${encodeURIComponent(offer.name)}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300`}>
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
              <CardTitle className={`text-center text-sm ${isHovered ? 'font-semibold' : ''} transition-all duration-300`}>
                {offer.name}
              </CardTitle>
            </CardHeader>
            {offerData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {offerData.totalConsultingHours > 0 && (
                  <Badge color={getBadgeColor('consulting')}>
                    {offerData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {offerData.totalHandsOnHours > 0 && (
                  <Badge color={getBadgeColor('handsOn')}>
                    {offerData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {offerData.totalSquadHours > 0 && (
                  <Badge color={getBadgeColor('squad')}>
                    {offerData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {offerData.totalInternalHours > 0 && (
                  <Badge color={getBadgeColor('internal')}>
                    {offerData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  const filteredOffers = data.offers.filter((offer: any) => {
    const offerData = data.timesheet.byOffer.find((o: any) => o.name === offer.name);
    if (!offerData) return selectedStat === 'allOffers';
    switch (selectedStat) {
      case 'total':
        return offerData.totalHours > 0;
      case 'consulting':
        return offerData.totalConsultingHours > 0;
      case 'handsOn':
        return offerData.totalHandsOnHours > 0;
      case 'squad':
        return offerData.totalSquadHours > 0;
      case 'internal':
        return offerData.totalInternalHours > 0;
      default:
        return true;
    }
  });

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading className="text-3xl font-bold text-gray-900">Products and Services</Heading>
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
                  className={`${getStatClassName('allOffers')} transform`}
                  onClick={() => handleStatClick('allOffers')}
                >
                  <Stat
                    title="All Offers"
                    value={data.offers.length.toString()}
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
                      title="Active Offers"
                      value={data.timesheet.byOffer.length.toString()}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('consulting')} transform`}
                    onClick={() => handleStatClick('consulting')}
                  >
                    <Stat
                      title="Consulting"
                      value={data.timesheet.byOffer.filter((o: any) => o.totalConsultingHours > 0).length.toString()}
                      color="#F59E0B"
                      total={data.timesheet.byOffer.length}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('handsOn')} transform`}
                    onClick={() => handleStatClick('handsOn')}
                  >
                    <Stat
                      title="Hands-On"
                      value={data.timesheet.byOffer.filter((o: any) => o.totalHandsOnHours > 0).length.toString()}
                      color="#8B5CF6"
                      total={data.timesheet.byOffer.length}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('squad')} transform`}
                    onClick={() => handleStatClick('squad')}
                  >
                    <Stat
                      title="Squad"
                      value={data.timesheet.byOffer.filter((o: any) => o.totalSquadHours > 0).length.toString()}
                      color="#3B82F6"
                      total={data.timesheet.byOffer.length}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('internal')} transform`}
                    onClick={() => handleStatClick('internal')}
                  >
                    <Stat
                      title="Internal"
                      value={data.timesheet.byOffer.filter((o: any) => o.totalInternalHours > 0).length.toString()}
                      color="#10B981"
                      total={data.timesheet.byOffer.length}
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