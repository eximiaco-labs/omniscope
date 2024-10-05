"use client";

import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
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

export default function AccountManagers() {
  const GET_ACCOUNT_MANAGERS = gql`
    query GetAccountManagers {
      accountManagers {
        slug
        name
        position
        photoUrl
        omniUrl
        errors
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ACCOUNT_MANAGERS, { ssr: true });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Account Managers</Heading>
      </div>

      <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
        <TableHead>
          <TableRow>
            <TableHeader>Account Manager</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.accountManagers.map((manager: any) => (
            <TableRow key={manager.slug} href={manager.omniUrl}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar src={manager.photoUrl} className="size-12" />
                  <div>
                    <div className="font-medium">{manager.name}</div>
                    <div className="text-zinc-500">
                      {manager.position.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                    </div>
                  </div>
                  <div className="mt-2">
                    {manager.errors.map((error: string) => (
                      <Badge key={error} color='rose' className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mb-1">
                        {error}
                      </Badge>
                    ))}
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