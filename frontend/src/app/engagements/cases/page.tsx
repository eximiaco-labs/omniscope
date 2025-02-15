"use client";

import { useState } from "react";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { useQuery } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { GET_CASES_AND_TIMESHEET } from "./queries";
import { CaseCard } from "./CaseCard";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { CasesGallery } from "./CasesGallery";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

interface Case {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  preContractedValue: boolean;
  sponsor: {
    name: string;
  };
  hasDescription: boolean;
  startOfContract: string;
  endOfContract: string;
  weeklyApprovedHours: number;
  client: {
    name: string;
  };
  isStale: boolean;
  updates: {
    data: Array<{
      date: string;
      status: string;
      author: string;
    }>;
  };
  timesheet?: {
    summary: {
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }
  }
}

export default function Cases() {
  const client = useEdgeClient();
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  const { loading, error, data } = useQuery(GET_CASES_AND_TIMESHEET, {
    variables: {
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    client: client ?? undefined,
    ssr: true
  });
  const [selectedStat, setSelectedStat] = useState<string>("allCases");

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.timesheet.filterableFields?.reduce((acc: any[], field: any) => {
        const fieldValues = newSelectedValues
          .filter(
            (v) =>
              typeof v.value === "string" &&
              v.value.startsWith(`${field.field}:`)
          )
          .map((v) => (v.value as string).split(":")[1]);

        if (fieldValues.length > 0) {
          acc.push({
            field: field.field,
            selectedValues: fieldValues,
          });
        }
        return acc;
      }, []) || [];

    setFormattedSelectedValues(formattedValues);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName
        ? "ring-2 ring-black shadow-lg scale-105"
        : "hover:scale-102"
    }`;
  };

  const cases = data.engagements.cases.data;
  const filteredCases = cases
    .filter((caseItem: any) => 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((caseItem: any) => {
      const timesheetData = caseItem.timesheet;
      if (!timesheetData) return selectedStat === "allCases";
      
      switch (selectedStat) {
        case "total":
          return timesheetData.summary.totalHours > 0;
        case "consulting":
          return timesheetData.summary.totalConsultingHours > 0;
        case "handsOn":
          return timesheetData.summary.totalHandsOnHours > 0;
        case "squad":
          return timesheetData.summary.totalSquadHours > 0;
        case "internal":
          return timesheetData.summary.totalInternalHours > 0;
        default:
          return true;
      }
    });

  return (
    <>
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-1"></div>
        <div className="col-span-5">
          <FilterFieldsSelect
            data={data.timesheet}
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <SectionHeader title="All Time" subtitle="" />
              <div
                className={`${getStatClassName("allCases")} transform`}
                onClick={() => handleStatClick("allCases")}
              >
                <Stat title="All Cases" value={cases.length.toString()} />
              </div>
            </div>
            <div className="lg:col-span-5">
              <SectionHeader title="Active" subtitle="Last Six Weeks" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div
                  className={`${getStatClassName("total")} transform`}
                  onClick={() => handleStatClick("total")}
                >
                  <Stat
                    title="Active Cases"
                    value={cases.filter((c: Case) => c.timesheet?.summary?.totalHours ?? 0 > 0).length.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={cases.filter((c: Case) => c.timesheet?.summary?.totalConsultingHours ?? 0 > 0).length.toString()}
                    color="#F59E0B"
                    total={cases.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={cases.filter((c: Case) => c.timesheet?.summary?.totalHandsOnHours ?? 0 > 0).length.toString()}
                    color="#8B5CF6"
                    total={cases.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={cases.filter((c: Case) => c.timesheet?.summary?.totalSquadHours ?? 0 > 0).length.toString()}
                    color="#3B82F6"
                    total={cases.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={cases.filter((c: Case) => c.timesheet?.summary?.totalInternalHours ?? 0 > 0).length.toString()}
                    color="#10B981"
                    total={cases.length}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-2">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CasesGallery 
              filteredCases={filteredCases} 
              timesheetData={data.timesheet} 
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
