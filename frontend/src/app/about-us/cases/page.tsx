"use client";

import { useState } from "react";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { GET_CASES_AND_TIMESHEET } from "./queries";
import { CaseCard } from "./CaseCard";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { CasesGallery } from "./CasesGallery";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const INVALIDATE_CACHE_MUTATION = gql`
  mutation InvalidateCache($key: String!) {
    invalidateCache(key: $key)
  }
`;

const GET_CACHE_QUERY = gql`
  query GetCache {
    cache {
      key
      createdAt
    }
  }
`;

export default function Cases() {
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_CASES_AND_TIMESHEET, {
    variables: {
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    ssr: true
  });
  const { data: cacheData } = useQuery(GET_CACHE_QUERY);
  const [invalidateCache] = useMutation(INVALIDATE_CACHE_MUTATION);
  const [selectedStat, setSelectedStat] = useState<string>("allCases");

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateCache({ variables: { key: "cases" } });
      const { data: newData } = await refetch();
      if (newData) {
        window.location.reload();
        toast.success("Case data refreshed successfully");
      }
    } catch (err) {
      toast.error("Failed to refresh case data");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

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

  const filteredCases = data.cases
    .filter((caseItem: any) => 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((caseItem: any) => {
      const caseData = data.timesheet.byCase.find(
        (c: any) => c.title === caseItem.title
      );
      if (!caseData) return selectedStat === "allCases";
      switch (selectedStat) {
        case "total":
          return caseData.totalHours > 0;
        case "consulting":
          return caseData.totalConsultingHours > 0;
        case "handsOn":
          return caseData.totalHandsOnHours > 0;
        case "squad":
          return caseData.totalSquadHours > 0;
        case "internal":
          return caseData.totalInternalHours > 0;
        default:
          return true;
      }
    });

  const casesCacheInfo = cacheData?.cache?.find((item: { key: string; }) => item.key === "cases");
  
  const formatLastUpdated = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo'
    });
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2 py-1 text-xs text-muted-foreground">
        <span>Last updated: {formatLastUpdated(casesCacheInfo?.createdAt)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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
                <Stat title="All Cases" value={data.cases.length.toString()} />
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
                    value={data.timesheet.byCase.length.toString()}
                  />
                </div>
                <div
                  className={`${getStatClassName("consulting")} transform`}
                  onClick={() => handleStatClick("consulting")}
                >
                  <Stat
                    title="Consulting"
                    value={data.timesheet.byCase
                      .filter((c: any) => c.totalConsultingHours > 0)
                      .length.toString()}
                    color="#F59E0B"
                    total={data.timesheet.byCase.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("handsOn")} transform`}
                  onClick={() => handleStatClick("handsOn")}
                >
                  <Stat
                    title="Hands-On"
                    value={data.timesheet.byCase
                      .filter((c: any) => c.totalHandsOnHours > 0)
                      .length.toString()}
                    color="#8B5CF6"
                    total={data.timesheet.byCase.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("squad")} transform`}
                  onClick={() => handleStatClick("squad")}
                >
                  <Stat
                    title="Squad"
                    value={data.timesheet.byCase
                      .filter((c: any) => c.totalSquadHours > 0)
                      .length.toString()}
                    color="#3B82F6"
                    total={data.timesheet.byCase.length}
                  />
                </div>
                <div
                  className={`${getStatClassName("internal")} transform`}
                  onClick={() => handleStatClick("internal")}
                >
                  <Stat
                    title="Internal"
                    value={data.timesheet.byCase
                      .filter((c: any) => c.totalInternalHours > 0)
                      .length.toString()}
                    color="#10B981"
                    total={data.timesheet.byCase.length}
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
