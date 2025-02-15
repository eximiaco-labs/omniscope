"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/catalyst/button";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SectionHeader from "@/components/SectionHeader";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const REFRESH_DATA_MUTATION = gql`
  mutation RefreshData {
    refreshData
  }
`;

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

export default function OmniSidebarFooter() {
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const router = useRouter();
  const [refreshData, { loading: refreshLoading }] = useMutation(
    REFRESH_DATA_MUTATION
  );
  const [invalidateCache] = useMutation(INVALIDATE_CACHE_MUTATION);
  const { data: cacheData, refetch: refetchCache } = useQuery(GET_CACHE_QUERY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/changelog")
      .then((res) => res.json())
      .then((entries) => {
        if (entries.length > 0) {
          setLatestEntry(entries[0]);
        }
      });
  }, []);

  const handleSoftRefresh = async () => {
    try {
      await refetchCache();
      toast.success("Cache updated", {
        description:
          "Frequently updated data like timesheets has been refreshed successfully.",
      });
      router.refresh();
    } catch (err) {
      toast.error("Failed to update cache", {
        description:
          "There was an issue updating the data. Please try again or contact support if the problem persists.",
      });
      console.error(err);
    }
  };

  const handleHardRefresh = async () => {
    try {
      if (cacheData?.cache) {
        for (const item of cacheData.cache) {
          await invalidateCache({ variables: { key: item.key } });
        }
      }

      const { data } = await refreshData();
      if (data.refreshData) {
        toast.success("System updated", {
          description:
            "All data including clients, cases and other core information has been reloaded successfully.",
        });
        await refetchCache();
        router.refresh();
      } else {
        setError("Complete system update failed");
        toast.error("Update failed", {
          description:
            "The system was unable to complete the full data refresh. Please try again or contact support.",
        });
      }
    } catch (err) {
      setError("System Error");
      toast.error("An error occurred", {
        description:
          "A critical error occurred during the update. Please contact technical support if this issue persists.",
      });
      console.error(err);
    }
  };

  if (!latestEntry) return null;

  const date = new Date(latestEntry.data.date);

  return (
    <>
      <SidebarGroup>
        <div className="text-xs text-[#3f3f46b2] mb-2">System Cache</div>
        <SidebarGroupContent className="md:px-0">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-600 leading-tight">
                Invalidates and refreshes timesheets (Everhour) cache.
              </p>
              <button
                onClick={handleSoftRefresh}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 transition-all rounded-md shadow-sm"
              >
                Run
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-600 leading-tight">
                Reloads all system data including core information.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 transition-all rounded-md shadow-sm"
                  >
                    Run
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirm Complete System Refresh
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-gray-600">
                      This operation will take longer. Continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleHardRefresh}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarGroup>
        <div className="text-xs text-[#3f3f46b2] mb-2">Changelog</div>
        <SidebarGroupContent className="px-1.5 md:px-0">
          <Link
            href={`/admin/changelog#changelog-${format(date, "yyyy-MM-dd")}`}
            className="block transition-all  -md hover:bg-gray-50 text-blue-600 hover:text-blue-700"
          >
            <div className="text-[11px] text-gray-400">
              {format(date, "MMMM d, yyyy", { locale: enUS })}
            </div>
            <div className="text-xs break-words whitespace-pre-wrap leading-tight">
              {latestEntry.data.title}
            </div>
          </Link>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
