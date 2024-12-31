"use client";

import { gql, useQuery } from "@apollo/client";
import { format, differenceInDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeader from "@/components/SectionHeader";

const GET_TRACKING_PROJECTS = gql`
  query GetTrackingProjects {
    cases(onlyActives: true) {
      title
      client {
        name
        accountManager {
          name
        }
      }
      tracker {
        id
        name
        dueOn
      }
      deals {
        title
        everhourId
        addTime
        wonTime
      }
    }
  }
`;

export default function TrackingProjectsPage() {
  const { data, loading, error } = useQuery(GET_TRACKING_PROJECTS);

  if (loading) return <Skeleton className="w-full h-48" />;
  if (error) return <div>Error loading data</div>;

  const filteredCases = data?.cases.filter(
    (caseItem: any) =>
      !caseItem.client.name.includes("EximiaCo") && caseItem.client.name !== "ElemarJR"
  );

  // Group cases by account manager
  const casesByManager = filteredCases?.reduce((acc: any, caseItem: any) => {
    const managerName = caseItem.client.accountManager.name;
    if (!acc[managerName]) {
      acc[managerName] = [];
    }
    acc[managerName].push(caseItem);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(casesByManager || {}).map(
        ([managerName, cases]: [string, any]) => (
          <>
            <SectionHeader
              title={managerName}
              subtitle={`${cases.length} tracking ${
                cases.length === 1 ? "project" : "projects"
              }`}
            />
            <div className="ml-2 mr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="border-r">Tracker ID</TableHead>
                    <TableHead className="border-r">Case</TableHead>
                    <TableHead className="border-r">Client</TableHead>
                    <TableHead className="border-r">Project Name</TableHead>
                    <TableHead className="bg-muted">Deal Title</TableHead>
                    <TableHead className="w-[150px] bg-muted">Start Date</TableHead>
                    <TableHead className="w-[150px] bg-muted">Won Date</TableHead>
                    <TableHead className="w-[150px] bg-muted">Sales Cycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem: any) =>
                    caseItem.tracker?.map((tracker: any) => {
                      const matchingDeal = caseItem.deals?.find(
                        (deal: any) => deal.everhourId === tracker.id
                      );
                      const salesCycle =
                        matchingDeal?.addTime && matchingDeal?.wonTime
                          ? `${differenceInDays(
                              new Date(matchingDeal.wonTime),
                              new Date(matchingDeal.addTime)
                            )} days`
                          : "N/A";
                          
                      const needsAttention = !matchingDeal || !matchingDeal.wonTime;
                      const rowClassName = needsAttention ? "bg-yellow-50" : "";
                      
                      return (
                        <TableRow key={tracker.id} className={rowClassName}>
                          <TableCell className="border-r">{tracker.id}</TableCell>
                          <TableCell className="border-r">{caseItem.title}</TableCell>
                          <TableCell className="border-r">{caseItem.client.name}</TableCell>
                          <TableCell className="border-r">{tracker.name}</TableCell>
                          <TableCell className="bg-muted/50">{matchingDeal?.title || "N/A"}</TableCell>
                          <TableCell className="bg-muted/50">
                            {matchingDeal?.addTime
                              ? format(new Date(matchingDeal.addTime), "PP")
                              : "N/A"}
                          </TableCell>
                          <TableCell className="bg-muted/50">
                            {matchingDeal?.wonTime
                              ? format(new Date(matchingDeal.wonTime), "PP")
                              : "N/A"}
                          </TableCell>
                          <TableCell className="bg-muted/50">{salesCycle}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )
      )}
    </div>
  );
}
