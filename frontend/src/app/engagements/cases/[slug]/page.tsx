"use client";

import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import Image from "next/image";
import { TimesheetSummary } from "@/app/components/TimesheetSummary";

const GET_CASE_INFO = gql`
  query GetCaseInfo($slug: String!) {
    engagements {
      case(slug: $slug) {
        title
        startOfContract
        endOfContract
        weeklyApprovedHours
        client {
          name
          logoUrl
          isStrategic
        }
      }
    }
  }
`;

interface CaseInfo {
  title: string;
  startOfContract: string;
  endOfContract: string;
  weeklyApprovedHours: number;
  client: {
    name: string;
    logoUrl: string;
    isStrategic: boolean;
  };
}

interface QueryData {
  engagements: {
    case: CaseInfo;
  };
}

export default function CasePage() {
  const params = useParams();
  const client = useEdgeClient();
  
  const { data, loading, error } = useQuery<QueryData>(GET_CASE_INFO, {
    client: client ?? undefined,
    variables: {
      slug: params.slug,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.engagements.case) return <div>Case not found</div>;

  const { title, client: clientInfo, weeklyApprovedHours, startOfContract, endOfContract } = data.engagements.case;
  const { name, logoUrl, isStrategic } = clientInfo;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const initialQueryFilters = [
    {
      field: "CaseTitle",
      selectedValues: [title]
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Client:</span>
                  <span className="text-lg font-medium text-gray-700">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className="text-lg font-medium text-gray-700">
                    {isStrategic ? "Strategic" : "Standard"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Weekly Hours:</span>
                  <span className="text-lg font-medium text-gray-700">{weeklyApprovedHours}h</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Start Date:</span>
                  <span className="text-lg font-medium text-gray-700">{formatDate(startOfContract)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">End Date:</span>
                  <span className="text-lg font-medium text-gray-700">{formatDate(endOfContract)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TimesheetSummary initialQueryFilters={initialQueryFilters} />
    </div>
  );
}
