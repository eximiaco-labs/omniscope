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
import clsx from "clsx";

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
        client {
          name
        }
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
            <TableRow key={sponsor.slug} href={`clients/${sponsor.slug}`} >
              <TableCell>
                <div className="flex items-center gap-4">
                  <span className="rounded-full *:rounded-full">
                    <img
                      alt=""
                      src={sponsor.photoUrl}
                      className={ clsx(
                        'inline-grid shrink-0 align-middle [--avatar-radius:20%] [--ring-opacity:20%] *:col-start-1 *:row-start-1',
                        'outline outline-1 -outline-offset-1 outline-black/[--ring-opacity] dark:outline-white/[--ring-opacity]',
                        'inline-block h-16 w-16 rounded-full object-cover'
                      )} 
                    />
                  </span>
                  <div>
                    <div className="font-medium">{sponsor.name}</div>
                    <div className="text-zinc-500">{sponsor.jobTitle}</div>
                    {sponsor.client && (
                        <div>
                          {sponsor.client.name}
                        </div>
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
