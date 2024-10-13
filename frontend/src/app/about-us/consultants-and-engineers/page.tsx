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
import { Button } from "@/components/catalyst/button";
import { useRouter } from "next/navigation";

export default function ConsultantsAndEngineers() {
  const GET_CONSULTANTS = gql`
    query GetConsultants {
      consultantsAndEngineers {
        slug
        name
        position
        photoUrl
        errors
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_CONSULTANTS, { ssr: true });
  const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleTimesheetClick = (workerName: string) => {
    const encodedWorkerName = encodeURIComponent(workerName);
    router.push(`/analytics/datasets/timesheet-this-month?WorkerName=${encodedWorkerName}`, { shallow: true });
  };

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Consultants & Engineers</Heading>
      </div>

      <div className="overflow-x-auto">
        <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)] w-full">
          <TableHead>
            <TableRow>
              <TableHeader>Consultant</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.consultantsAndEngineers.map((w: any) => (
              <TableRow key={w.slug}>
                <TableCell>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar src={w.photoUrl} className="size-16" />
                    <div className="flex-grow">
                      <div className="font-medium">{w.name}</div>
                      <div className="text-zinc-500">
                        {w.position.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                      </div>
                      <div className="mt-2">
                        {w.errors.map((error: string) => (
                          <Badge key={error} color='rose' className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mb-1">
                            {error}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        onClick={() => handleTimesheetClick(w.name)} 
                        className="mt-2 px-1.5 py-0.5 text-xs cursor-pointer"
                      >
                        Timesheet
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
