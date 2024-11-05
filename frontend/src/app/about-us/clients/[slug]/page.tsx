"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GET_CLIENT_BY_SLUG, GET_CLIENT_TIMESHEET } from "./queries";
import { ClientHeader } from "./ClientHeader";
import TopWorkers from "@/app/components/panels/TopWorkers";
import TopSponsors from "@/app/components/panels/TopSponsors";
import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { CasesGallery } from "../../cases/CasesGallery";
import { CasesTable } from "./CasesTable";

export default function ClientPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDataset, setSelectedDataset] = useState<string>(
    "timesheet-last-six-weeks"
  );
  const [selectedStat, setSelectedStat] = useState("total");

  const {
    data: clientData,
    loading: clientLoading,
    error: clientError,
  } = useQuery(GET_CLIENT_BY_SLUG, {
    variables: { slug },
  });

  const {
    data: timesheetData,
    loading: timesheetLoading,
    error: timesheetError,
  } = useQuery(GET_CLIENT_TIMESHEET, {
    variables: {
      clientName: clientData?.client?.name,
      datasetSlug: selectedDataset,
    },
    skip: !selectedDataset || !clientData?.client?.name,
  });

  useEffect(() => {
    const datasetParam = searchParams.get("dataset");
    if (datasetParam) {
      setSelectedDataset(datasetParam);
    }
  }, [searchParams]);

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    router.push(`/about-us/clients/${slug}?dataset=${value}`);
  };

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName === selectedStat ? "total" : statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName
        ? "ring-2 ring-black shadow-lg scale-105"
        : "hover:scale-102"
    }`;
  };

  const getStatusColor = (status: string): "zinc" | "rose" | "amber" | "lime" => {
    switch (status) {
      case "Critical":
        return "rose";
      case "Requires attention":
        return "amber";
      case "All right":
        return "lime";
      default:
        return "zinc";
    }
  };

  const getDaysSinceUpdate = (updateDate: string | null) => {
    if (!updateDate) return null;
    const update = new Date(updateDate);
    const today = new Date();
    const diffTime = today.getTime() - update.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (clientLoading) return <p>Loading client data...</p>;
  if (clientError) return <p>Error loading client: {clientError.message}</p>;

  const timesheet = timesheetData?.timesheet;

  const filteredCases = timesheet?.byCase?.filter((caseData: any) => {
    switch (selectedStat) {
      case "consulting":
        return caseData.totalConsultingHours > 0;
      case "handsOn":
        return caseData.totalHandsOnHours > 0;
      case "squad":
        return caseData.totalSquadHours > 0;
      case "internal":
        return caseData.totalInternalHours > 0;
      case "total":
        return caseData.totalHours > 0;
      default:
        return true;
    }
  }) || [];

  return (
    <div>
      <ClientHeader client={clientData?.client} />

      <div className="mt-6 mb-6">
        <DatasetSelector
          selectedDataset={selectedDataset}
          onDatasetSelect={handleDatasetSelect}
        />
      </div>

      {timesheetLoading ? (
        <p>Loading timesheet data...</p>
      ) : timesheetError ? (
        <p>Error loading timesheet: {timesheetError.message}</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div
              className={`${getStatClassName("total")} transform`}
              onClick={() => handleStatClick("total")}
            >
              <Stat
                title="Total Hours"
                value={timesheet?.totalHours?.toString() || "0"}
              />
            </div>
            <div
              className={`${getStatClassName("consulting")} transform`}
              onClick={() => handleStatClick("consulting")}
            >
              <Stat
                title="Consulting Hours"
                value={
                  timesheet?.byKind?.consulting?.totalHours?.toString() || "0"
                }
                color="#F59E0B"
                total={timesheet?.totalHours}
              />
            </div>
            <div
              className={`${getStatClassName("handsOn")} transform`}
              onClick={() => handleStatClick("handsOn")}
            >
              <Stat
                title="Hands-On Hours"
                value={
                  timesheet?.byKind?.handsOn?.totalHours?.toString() || "0"
                }
                color="#8B5CF6"
                total={timesheet?.totalHours}
              />
            </div>
            <div
              className={`${getStatClassName("squad")} transform`}
              onClick={() => handleStatClick("squad")}
            >
              <Stat
                title="Squad Hours"
                value={timesheet?.byKind?.squad?.totalHours?.toString() || "0"}
                color="#3B82F6"
                total={timesheet?.totalHours}
              />
            </div>
            <div
              className={`${getStatClassName("internal")} transform`}
              onClick={() => handleStatClick("internal")}
            >
              <Stat
                title="Internal Hours"
                value={
                  timesheet?.byKind?.internal?.totalHours?.toString() || "0"
                }
                color="#10B981"
                total={timesheet?.totalHours}
              />
            </div>
          </div>

          <div className="mt-6">
            <CasesTable filteredCases={filteredCases} />
          </div>

          <Divider className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <TopWorkers
              workerData={timesheet?.byWorker || []}
              selectedStat={selectedStat}
              totalHours={timesheet?.totalHours || 0}
            />
            <TopSponsors
              sponsorData={timesheet?.bySponsor || []}
              selectedStat={selectedStat}
              totalHours={timesheet?.totalHours || 0}
            />
          </div>

          <Divider className="my-8" />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Cases</h2>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                {filteredCases.length || 0}
              </span>
            </div>
          </div>

          <CasesGallery
            filteredCases={filteredCases}
            timesheetData={timesheet}
          />
        </>
      )}
    </div>
  );
}
