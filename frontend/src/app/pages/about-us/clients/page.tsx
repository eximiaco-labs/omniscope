"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      logoUrl
      name
      isStrategic
      slug
    }
  }
`;

export default function Clients() {
  const { loading, error, data } = useQuery(GET_CLIENTS, { ssr: true });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const strategicClients = data.clients.filter((client: any) => client.isStrategic);
  const nonStrategicClients = data.clients.filter((client: any) => !client.isStrategic);

  const ClientCard = ({ client }: { client: any }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Link 
        href={`clients/${client.slug}`} 
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
          </CardContent>
        </Card>
      </Link>
    );
  };

  const ClientGallery = ({ clients, title }: { clients: any[], title: string }) => (
    <div className="mb-8">
      <Heading className="mb-4">{title}</Heading>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {clients.map((client: any) => (
          <ClientCard key={client.slug} client={client} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Clients</Heading>
      </div>
      <div className="container mx-auto px-4 py-8">
        <ClientGallery clients={strategicClients} title="Strategic Clients" />
        <ClientGallery clients={nonStrategicClients} title="Other Clients" />
      </div>
    </>
  );
}