"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/catalyst/badge";

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      logoUrl
      name
      isStrategic
      slug
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
      byClient {
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

export default function Clients() {
  const { loading, error, data } = useQuery(GET_CLIENTS, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>('allClients');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const strategicClients = data.clients.filter((client: any) => client.isStrategic);
  const nonStrategicClients = data.clients.filter((client: any) => !client.isStrategic);

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const ClientCard = ({ client }: { client: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    const clientData = data.timesheet.byClient.find((c: any) => c.name === client.name);

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
        href={`/analytics/datasets/timesheet-this-month?ClientName=${encodeURIComponent(client.name)}`}
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300`}>
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-full h-32 relative mb-2">
              <Image
                src={client.logoUrl}
                alt={`${client.name} logo`}
                layout="fill"
                objectFit="contain"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
            <CardHeader className="p-0 mt-2">
              <CardTitle className={`text-center text-sm ${isHovered ? 'font-semibold' : ''} transition-all duration-300`}>
                {client.name}
              </CardTitle>
            </CardHeader>
            {clientData && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {clientData.totalConsultingHours > 0 && (
                  <Badge color={getBadgeColor('consulting')}>
                    {clientData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {clientData.totalHandsOnHours > 0 && (
                  <Badge color={getBadgeColor('handsOn')}>
                    {clientData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {clientData.totalSquadHours > 0 && (
                  <Badge color={getBadgeColor('squad')}>
                    {clientData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
                {clientData.totalInternalHours > 0 && (
                  <Badge color={getBadgeColor('internal')}>
                    {clientData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  const ClientGallery = ({ clients, title }: { clients: any[], title: string }) => {
    const filteredClients = clients.filter((client: any) => {
      const clientData = data.timesheet.byClient.find((c: any) => c.name === client.name);
      if (!clientData) return selectedStat === 'allClients';
      switch (selectedStat) {
        case 'total':
          return clientData.totalHours > 0;
        case 'consulting':
          return clientData.totalConsultingHours > 0;
        case 'handsOn':
          return clientData.totalHandsOnHours > 0;
        case 'squad':
          return clientData.totalSquadHours > 0;
        case 'internal':
          return clientData.totalInternalHours > 0;
        default:
          return true;
      }
    });

    if (filteredClients.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Heading level={3} className="text-xl font-semibold text-gray-800">{title}</Heading>
          <span className="text-sm font-medium text-gray-600">{filteredClients.length} clients</span>
        </div>
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredClients.map((client: any) => (
              <motion.div
                key={client.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ClientCard client={client} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading className="text-3xl font-bold text-gray-900">Clients</Heading>
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
                  className={`${getStatClassName('allClients')} transform`}
                  onClick={() => handleStatClick('allClients')}
                >
                  <Stat
                    title="All Clients"
                    value={data.clients.length.toString()}
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
                      title="Active Clients"
                      value={data.timesheet.uniqueClients.toString()}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('consulting')} transform`}
                    onClick={() => handleStatClick('consulting')}
                  >
                    <Stat
                      title="Consulting"
                      value={data.timesheet.byKind.consulting.uniqueClients.toString()}
                      color="#F59E0B"
                      total={data.timesheet.uniqueClients}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('handsOn')} transform`}
                    onClick={() => handleStatClick('handsOn')}
                  >
                    <Stat
                      title="Hands-On"
                      value={data.timesheet.byKind.handsOn.uniqueClients.toString()}
                      color="#8B5CF6"
                      total={data.timesheet.uniqueClients}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('squad')} transform`}
                    onClick={() => handleStatClick('squad')}
                  >
                    <Stat
                      title="Squad"
                      value={data.timesheet.byKind.squad.uniqueClients.toString()}
                      color="#3B82F6"
                      total={data.timesheet.uniqueClients}
                    />
                  </div>
                  <div
                    className={`${getStatClassName('internal')} transform`}
                    onClick={() => handleStatClick('internal')}
                  >
                    <Stat
                      title="Internal"
                      value={data.timesheet.byKind.internal.uniqueClients.toString()}
                      color="#10B981"
                      total={data.timesheet.uniqueClients}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Divider className="my-8" />
        <ClientGallery clients={strategicClients} title="Strategic Clients" />
        <ClientGallery clients={nonStrategicClients} title="Other Clients" />
      </div>
    </>
  );
}