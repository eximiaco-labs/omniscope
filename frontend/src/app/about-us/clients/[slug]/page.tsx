"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GET_CLIENT_BY_SLUG, GET_CLIENT_TIMESHEET } from "./queries";
import { ClientHeader } from "./ClientHeader";
import { Divider } from "@/components/catalyst/divider";
import { CasesGallery } from "../../cases/CasesGallery";
import { AllocationSection } from "./AllocationSection";

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

  const getStatusColor = (
    status: string
  ): "zinc" | "rose" | "amber" | "lime" => {
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
    <div>
      <ClientHeader client={clientData?.client} />

      <AllocationSection
        selectedDataset={selectedDataset}
        onDatasetSelect={handleDatasetSelect}
        timesheetData={timesheetData}
        timesheetLoading={timesheetLoading}
        timesheetError={timesheetError}
        selectedStat={selectedStat}
        handleStatClick={handleStatClick}
      />

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
    </div>
  );
}
