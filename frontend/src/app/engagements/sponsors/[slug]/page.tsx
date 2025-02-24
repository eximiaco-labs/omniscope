"use client";

import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import { TimesheetSummary } from "@/app/components/TimesheetSummary";

const GET_SPONSOR_INFO = gql`
  query GetSponsorInfo($slug: String!) {
    engagements {
      sponsor(slug: $slug) {
        name
        jobTitle
        photoUrl
        linkedinUrl
        client {
          name
        }
      }
    }
  }
`;

interface SponsorInfo {
  name: string;
  jobTitle: string;
  photoUrl: string;
  linkedinUrl: string;
  client: {
    name: string;
  };
}

interface QueryData {
  engagements: {
    sponsor: SponsorInfo;
  };
}

export default function SponsorPage() {
  const params = useParams();
  const apolloClient = useEdgeClient();
  
  const { data, loading, error } = useQuery<QueryData>(GET_SPONSOR_INFO, {
    client: apolloClient ?? undefined,
    variables: {
      slug: params.slug,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.engagements.sponsor) return <div>Sponsor not found</div>;

  const { name, jobTitle, photoUrl, linkedinUrl, client: sponsorClient } = data.engagements.sponsor;

  const initialQueryFilters = [
    {
      field: "Sponsor",
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
              <p className="text-lg text-gray-600 mt-1">{jobTitle}</p>
              {sponsorClient && (
                <p className="text-sm text-gray-500 mt-1">
                  {sponsorClient.name}
                </p>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm mt-2"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn Profile</span>
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
