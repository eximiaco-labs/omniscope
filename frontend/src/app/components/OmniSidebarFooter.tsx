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
      <div className="space-y-4">
        <div>
          <SectionHeader title="System Cache" subtitle="" />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSoftRefresh}
              className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title="Refresh frequently updated data"
            >
              {refreshLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowPathIcon className="h-4 w-4" />
              )}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="px-2 py-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all text-xs font-medium"
                  title="Complete system refresh"
                >
                  {refreshLoading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    "Full Refresh"
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm Complete System Refresh
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    This will take longer than a soft refresh. Continue?
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
        <div>
          <SectionHeader title="Changelog" subtitle="Last update" />
          <Link
            href={`/admin/changelog#changelog-${format(date, "yyyy-MM-dd")}`}
            className="block transition-all border border-transparent hover:border-gray-200 mt-2 p-2 rounded-md hover:bg-gray-50 text-blue-600 hover:text-blue-700"
          >
            <div className="space-y-1">
              <div className="text-xs text-gray-400">
                {format(date, "MMMM d, yyyy", { locale: enUS })}
              </div>
              <div className="text-sm break-words whitespace-pre-wrap">
                {latestEntry.data.title}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
