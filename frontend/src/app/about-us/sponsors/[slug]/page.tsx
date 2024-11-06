"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GET_SPONSOR_BY_SLUG, GET_SPONSOR_TIMESHEET } from "./queries";
import { SponsorHeader } from "./SponsorHeader";
import TopWorkers from "@/app/components/panels/TopWorkers";
import TopClients from "@/app/components/panels/TopClients";
import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { CasesGallery } from "../../cases/CasesGallery";
import { CasesTable } from "../../clients/[slug]/CasesTable";

export default function SponsorPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDataset, setSelectedDataset] = useState<string>(
    "timesheet-last-six-weeks"
  );
  const [selectedStat, setSelectedStat] = useState("total");

  const {
    data: sponsorData,
    loading: sponsorLoading,
    error: sponsorError,
  } = useQuery(GET_SPONSOR_BY_SLUG, {
    variables: { slug },
  });

  const {
    data: timesheetData,
    loading: timesheetLoading,
    error: timesheetError,
  } = useQuery(GET_SPONSOR_TIMESHEET, {
    variables: {
      sponsorName: sponsorData?.sponsor?.name,
      datasetSlug: selectedDataset,
    },
    skip: !selectedDataset || !sponsorData?.sponsor?.name,
  });

  useEffect(() => {
    const datasetParam = searchParams.get("dataset");
    if (datasetParam) {
      setSelectedDataset(datasetParam);
    }
  }, [searchParams]);

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    router.push(`/about-us/sponsors/${slug}?dataset=${value}`);
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

  if (sponsorLoading) return <p>Loading sponsor data...</p>;
  if (sponsorError) return <p>Error loading sponsor: {sponsorError.message}</p>;

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
      {sponsorData?.sponsor && (
        <SponsorHeader 
          sponsor={{
            name: sponsorData.sponsor.name,
            photoUrl: sponsorData.sponsor.photoUrl,
            jobTitle: sponsorData.sponsor.jobTitle,
            linkedinUrl: sponsorData.sponsor.linkedinUrl,
            client: {
              id: sponsorData.sponsor.client.id,
              name: sponsorData.sponsor.client.name
            }
          }}
        />
      )}

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
                value={timesheet?.byKind?.consulting?.totalHours?.toString() || "0"}
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
                value={timesheet?.byKind?.handsOn?.totalHours?.toString() || "0"}
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
                value={timesheet?.byKind?.internal?.totalHours?.toString() || "0"}
                color="#10B981"
                total={timesheet?.totalHours}
              />
            </div>
          </div>

          <div className="mt-6">
            <CasesTable filteredCases={filteredCases} showSponsorColumn={false} />
          </div>

          {/*<Divider className="my-6" />*/}

          {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">*/}
          {/*  <TopWorkers*/}
          {/*    workerData={timesheet?.byWorker || []}*/}
          {/*    selectedStat={selectedStat}*/}
          {/*    totalHours={timesheet?.totalHours || 0}*/}
          {/*  />*/}
          {/*  <TopClients*/}
          {/*    clientData={timesheet?.byClient || []}*/}
          {/*    selectedStat={selectedStat}*/}
          {/*    totalHours={timesheet?.totalHours || 0}*/}
          {/*  />*/}
          {/*</div>*/}

          {/*<Divider className="my-8" />*/}

          {/*<div className="flex items-center justify-between mb-6">*/}
          {/*  <h2 className="text-2xl font-semibold">Cases</h2>*/}
          {/*  <div className="flex items-center gap-2">*/}
          {/*    <span className="text-lg font-medium">*/}
          {/*      {filteredCases.length || 0}*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<CasesGallery*/}
          {/*  filteredCases={filteredCases}*/}
          {/*  timesheetData={timesheet}*/}
          {/*/>*/}
        </>
      )}
    </div>
  );
} 