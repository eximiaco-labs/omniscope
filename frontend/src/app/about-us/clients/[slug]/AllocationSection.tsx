"use client";

import React from "react";
import { Stat } from "@/app/components/analytics/stat";
import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";
import TopWorkers from "@/app/components/panels/TopWorkers";
import TopSponsors from "@/app/components/panels/TopSponsors";
import { CasesTable } from "./CasesTable";
import { Divider } from "@/components/catalyst/divider";
import SectionHeader from "@/components/SectionHeader";

interface AllocationSectionProps {
  selectedDataset: string;
  onDatasetSelect: (value: string) => void;
  timesheetData: any;
  timesheetLoading: boolean;
  timesheetError: any;
  selectedStat: string;
  handleStatClick: (statName: string) => void;
}

export function AllocationSection({
  selectedDataset,
  onDatasetSelect,
  timesheetData,
  timesheetLoading,
  timesheetError,
  selectedStat,
  handleStatClick,
}: AllocationSectionProps) {
  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName
        ? "ring-2 ring-black shadow-lg scale-105"
        : "hover:scale-102"
    }`;
  };

  const timesheet = timesheetData?.timesheet;

  const filteredCases =
    timesheet?.byCase?.filter((caseData: any) => {
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
    <>
      <SectionHeader title="ALLOCATION" subtitle="" />
      <div className="px-2">
        <div className="mb-4">
          <DatasetSelector
            selectedDataset={selectedDataset}
            onDatasetSelect={onDatasetSelect}
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
          </>
        )}
      </div>
    </>
  );
} 