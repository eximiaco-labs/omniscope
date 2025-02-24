"use client";

import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { TimesheetSummary } from "@/app/components/TimesheetSummary";

const GET_ACCOUNT_MANAGER_INFO = gql`
  query GetAccountManagerInfo($slug: String!) {
    team {
      accountManager(slug: $slug) {
        name
        position
        ontologyUrl
        photoUrl
      }
    }
  }
`;

interface AccountManagerInfo {
  name: string;
  position: string;
  photoUrl: string;
  ontologyUrl: string;
}

interface QueryData {
  team: {
    accountManager: AccountManagerInfo;
  };
}

export default function AccountManagerPage() {
  const params = useParams();
  const client = useEdgeClient();
  
  const { data, loading, error } = useQuery<QueryData>(GET_ACCOUNT_MANAGER_INFO, {
    client: client ?? undefined,
    variables: {
      slug: params.slug,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.team.accountManager) return <div>Account Manager not found</div>;

  const { name, position, photoUrl, ontologyUrl } = data.team.accountManager;

  const initialQueryFilters = [
    {
      field: "AccountManagerName",
      selectedValues: [name]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8 border-b pb-6">
        {photoUrl && (
          <div className="relative w-24 h-24 overflow-hidden rounded-lg shadow-md flex-shrink-0">
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="96px"
              priority
            />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-lg text-gray-600 mt-1">{position}</p>
              {ontologyUrl && (
                <a
                  href={ontologyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm mt-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ontology</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <TimesheetSummary initialQueryFilters={initialQueryFilters} />
    </div>
  );
}
