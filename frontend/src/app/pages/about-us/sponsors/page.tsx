"use client";

import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import { gql, useQuery } from "@apollo/client";

export default function Sponsors() {
  const GET_SPONSORS = gql`
    query GetSponsors {
      sponsors {
        slug
        name
        photoUrl
        jobTitle
        linkedinUrl
        omniUrl
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_SPONSORS, { ssr: true });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Sponsors</Heading>
      </div>

      <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
        <TableHead>
          <TableRow>
            <TableHeader>Sponsor</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.sponsors.map((sponsor: any) => (
            <TableRow key={sponsor.slug} href={sponsor.omniUrl}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar src={sponsor.photoUrl} className="size-12" />
                  <div>
                    <div className="font-medium">{sponsor.name}</div>
                    <div className="text-zinc-500">{sponsor.jobTitle}</div>
                    {sponsor.linkedinUrl && (
                      <a href={sponsor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
