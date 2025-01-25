"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { PRO_RATA_QUERY } from "./query";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number, total: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / total);
};

export default function ProRataPage() {
  const client = useEdgeClient();
  const [date, setDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 0));
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const today = new Date();
    const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    setDate(lastDayOfPreviousMonth);
  }, []);

  const { loading, error, data } = useQuery(PRO_RATA_QUERY, {
    variables: { dateOfInterest: format(date, "yyyy-MM-dd") },
    client: client ?? undefined,
    ssr: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { proRataInfo } = data.financial.revenueTracking;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderExpandIcon = (id: string) => {
    return expanded[id] ? (
      <ChevronDownIcon className="w-4 h-4 inline mr-2" />
    ) : (
      <ChevronRightIcon className="w-4 h-4 inline mr-2" />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>

      <div className="px-2">
        {proRataInfo.byKind.data.map((kind: any) => {
          const kindTotal = {
            penalty: kind.penalty,
          };

          return (
            <div key={kind.kind} className="mb-8">
              <SectionHeader
                title={kind.kind === "handsOn" ? "hands-on" : kind.kind}
                subtitle=""
              />
              <div className="px-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Hours
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Partial Fee
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Penalty
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kind.byAccountManager.data.map((manager: any) => (
                      <>
                        <TableRow
                          key={manager.name}
                          className="font-bold bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {manager.name}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(manager.penalty)}
                          </TableCell>
                        </TableRow>

                        {manager.byClient.data.map((client: any) => (
                          <>
                            <TableRow
                              key={`${manager.name}-${client.name}`}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                toggleExpand(
                                  `client-${manager.name}-${client.name}`
                                )
                              }
                            >
                              <TableCell className="pl-8">
                                {renderExpandIcon(
                                  `client-${manager.name}-${client.name}`
                                )}
                                {client.name}
                              </TableCell>
                              <TableCell className="text-right">-</TableCell>
                              <TableCell className="text-right">-</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(client.penalty)}
                              </TableCell>
                            </TableRow>

                            {expanded[
                              `client-${manager.name}-${client.name}`
                            ] &&
                              client.bySponsor.data.map((sponsor: any) => (
                                <>
                                  <TableRow
                                    key={`${manager.name}-${client.name}-${sponsor.name}`}
                                    className="hover:bg-gray-50 cursor-pointer bg-gray-50"
                                    onClick={() =>
                                      toggleExpand(
                                        `sponsor-${manager.name}-${client.name}-${sponsor.name}`
                                      )
                                    }
                                  >
                                    <TableCell className="pl-12">
                                      {renderExpandIcon(
                                        `sponsor-${manager.name}-${client.name}-${sponsor.name}`
                                      )}
                                      {sponsor.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      -
                                    </TableCell>
                                    <TableCell className="text-right">
                                      -
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {formatNumber(sponsor.penalty)}
                                    </TableCell>
                                  </TableRow>

                                  {expanded[
                                    `sponsor-${manager.name}-${client.name}-${sponsor.name}`
                                  ] &&
                                    sponsor.byCase.data.map((case_: any) => (
                                      <>
                                        <TableRow
                                          key={`${manager.name}-${client.name}-${sponsor.name}-${case_.title}`}
                                          className="hover:bg-gray-50 cursor-pointer bg-gray-100"
                                          onClick={() =>
                                            toggleExpand(
                                              `case-${manager.name}-${client.name}-${sponsor.name}-${case_.title}`
                                            )
                                          }
                                        >
                                          <TableCell className="pl-16">
                                            {renderExpandIcon(
                                              `case-${manager.name}-${client.name}-${sponsor.name}-${case_.title}`
                                            )}
                                            {case_.title}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            -
                                          </TableCell>
                                          <TableCell className="text-right">
                                            -
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {formatNumber(case_.penalty)}
                                          </TableCell>
                                        </TableRow>

                                        {expanded[
                                          `case-${manager.name}-${client.name}-${sponsor.name}-${case_.title}`
                                        ] &&
                                          case_.byProject.data.map(
                                            (project: any) => (
                                              <>
                                                <TableRow
                                                  key={`${manager.name}-${client.name}-${sponsor.name}-${case_.title}-${project.name}`}
                                                  className="hover:bg-gray-50 cursor-pointer bg-gray-150"
                                                  onClick={() =>
                                                    toggleExpand(
                                                      `project-${manager.name}-${client.name}-${sponsor.name}-${case_.title}-${project.name}`
                                                    )
                                                  }
                                                >
                                                  <TableCell className="pl-20">
                                                    {renderExpandIcon(
                                                      `project-${manager.name}-${client.name}-${sponsor.name}-${case_.title}-${project.name}`
                                                    )}
                                                    {project.name}
                                                  </TableCell>
                                                  <TableCell className="text-right">
                                                    -
                                                  </TableCell>
                                                  <TableCell className="text-right">
                                                    {formatNumber(
                                                      project.partialFee
                                                    )}
                                                  </TableCell>
                                                  <TableCell className="text-right">
                                                    {formatNumber(
                                                      project.penalty
                                                    )}
                                                  </TableCell>
                                                </TableRow>

                                                {expanded[
                                                  `project-${manager.name}-${client.name}-${sponsor.name}-${case_.title}-${project.name}`
                                                ] &&
                                                  project.byWorker.data.map(
                                                    (worker: any) => (
                                                      <TableRow
                                                        key={`${manager.name}-${client.name}-${sponsor.name}-${case_.title}-${project.name}-${worker.name}`}
                                                        className="bg-gray-200"
                                                      >
                                                        <TableCell className="pl-24">
                                                          {worker.name}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                          {formatNumber(
                                                            worker.hours
                                                          )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                          {formatNumber(
                                                            worker.partialFee
                                                          )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                          {formatNumber(
                                                            worker.penalty
                                                          )}
                                                        </TableCell>
                                                      </TableRow>
                                                    )
                                                  )}
                                              </>
                                            )
                                          )}
                                      </>
                                    ))}
                                </>
                              ))}
                          </>
                        ))}
                      </>
                    ))}
                    <TableRow className="font-bold border-t-2 border-gray-300">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(kindTotal.penalty)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
