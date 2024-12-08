import React from "react";
import Image from "next/image";
import { Badge } from "@/components/catalyst/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading } from "@/components/catalyst/heading";
import Link from "next/link";

interface ClientHeaderProps {
  client: {
    name: string;
    logoUrl: string;
    isStrategic: boolean;
    ontologyUrl?: string;
    accountManager?: {
      name: string;
      position: string;
      photoUrl: string;
      slug: string;
    };
  };
}

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <div className="bg-white p-6">
      <div className="flex items-center">
        <div className="flex items-center justify-center h-full mr-8 border-r pr-8 border-gray-200">
          <div className="relative w-24 h-24">
            <Image
              src={client.logoUrl}
              alt={`${client.name} logo`}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        <div className="flex flex-col flex-grow space-y-3">
          <div>
            <div className="flex flex-col lg:max-w-[80%]">
              <div className="flex items-center gap-3">
                <Heading className="text-2xl font-bold text-gray-900">
                  {client.name}
                </Heading>
                {client.isStrategic && (
                  <Badge color="amber">Strategic</Badge>
                )}
              </div>

              {client.ontologyUrl && (
                <span className="text-xs mt-2">
                  <a
                    href={client.ontologyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    View Ontology
                  </a>
                </span>
              )}
            </div>
          </div>

          {client.accountManager && (
            <div className="flex items-center gap-3">
              <Link href={`/about-us/consultants-and-engineers/${client.accountManager.slug}`}>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={client.accountManager.photoUrl} alt={client.accountManager.name} />
                    <AvatarFallback>{client.accountManager.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{client.accountManager.name}</span>
                    <span className="text-xs text-gray-500">{client.accountManager.position}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
