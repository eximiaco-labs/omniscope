"use client";

import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import Image from "next/image";
import { TimesheetSummary } from "@/app/components/TimesheetSummary";

const GET_CLIENT_INFO = gql`
  query GetClientInfo($slug: String!) {
    engagements {
      client(slug: $slug) {
        name
        logoUrl
        isStrategic
        activeCases {
          data {
            title
            startOfContract
            endOfContract
            weeklyApprovedHours
          }
        }
      }
    }
  }
`;

interface ClientInfo {
  name: string;
  logoUrl: string;
  isStrategic: boolean;
  activeCases: {
    data: Array<{
      title: string;
      startOfContract: string;
      endOfContract: string;
      weeklyApprovedHours: number;
    }>;
  };
}

interface QueryData {
  engagements: {
    client: ClientInfo;
  };
}

export default function ClientPage() {
  const params = useParams();
  const client = useEdgeClient();
  
  const { data, loading, error } = useQuery<QueryData>(GET_CLIENT_INFO, {
    client: client ?? undefined,
    variables: {
      slug: params.slug,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.engagements.client) return <div>Client not found</div>;

  const { name, logoUrl, isStrategic, activeCases } = data.engagements.client;

  const initialQueryFilters = [
    {
      field: "ClientName",
      selectedValues: [name]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8 border-b pb-6">
        {logoUrl && (
          <div className="relative w-24 h-24 overflow-hidden rounded-lg shadow-md flex-shrink-0">
            <Image
              src={logoUrl}
              alt={name}
              fill
              className="object-contain"
              sizes="96px"
              priority
            />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {isStrategic ? "Strategic Client" : "Client"}
              </p>
              {activeCases?.data.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Active Cases: {activeCases.data.length}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <TimesheetSummary initialQueryFilters={initialQueryFilters} />
    </div>
  );
}
