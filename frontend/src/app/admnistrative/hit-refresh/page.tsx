'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/catalyst/button';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { gql, useMutation, useQuery } from '@apollo/client';
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

export default function HitRefresh() {
  const router = useRouter();
  const [refreshData, { loading: refreshLoading }] = useMutation(REFRESH_DATA_MUTATION);
  const [invalidateCache, { loading: invalidateLoading }] = useMutation(INVALIDATE_CACHE_MUTATION);
  const { data: cacheData, refetch: refetchCache, loading: cacheLoading } = useQuery(GET_CACHE_QUERY);
  const [error, setError] = useState<string | null>(null);

  const handleSoftRefresh = async () => {
    try {
      await refetchCache();
      toast.success("In-memory cache refreshed", {
        description: "Fast-access data has been updated.",
      });
    } catch (err) {
      toast.error("Failed to refresh in-memory cache");
      console.error(err);
    }
  };

  const handleCacheItemInvalidation = async (key: string) => {
    try {
      const { data } = await invalidateCache({ variables: { key } });
      if (data.invalidateCache) {
        toast.success(`Cache item "${key}" invalidated`, {
          description: "The selected cache item has been refreshed.",
        });
        await refetchCache();
      }
    } catch (err) {
      toast.error("Failed to invalidate cache item");
      console.error(err);
    }
  };

  const handleHardRefresh = async () => {
    try {
      // Invalidate all cache keys
      if (cacheData?.cache) {
        for (const item of cacheData.cache) {
          await invalidateCache({ variables: { key: item.key } });
        }
      }

      // Then refresh data
      const { data } = await refreshData();
      if (data.refreshData) {
        toast.success("Full system refresh completed", {
          description: "All cache items have been invalidated and refreshed.",
          action: {
            label: "View Progress", 
            onClick: () => router.push('/system-status'),
          },
        });
        await refetchCache();
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError("Failed to refresh data");
        toast.error("Failed to refresh data", {
          description: "Please try again later.",
        });
      }
    } catch (err) {
      setError("An error occurred");
      toast.error("An error occurred", {
        description: "Please try again or contact support if the issue persists.", 
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">System Cache Management</h1>
          <p className="mt-4 text-lg text-gray-600">
            Optimize system performance by managing different levels of cache data.
          </p>
        </div>

        <div className="space-y-8">
          <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl">
            <div className="divide-y divide-gray-200">
              {/* Soft Refresh Section */}
              <div className="p-6 bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Refresh</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Refresh fast-access, in-memory cached data for immediate performance optimization.
                    </p>
                    <p className="mt-2 text-sm font-medium text-green-700">
                      ✨ Recommended for most situations - This is the safest and fastest way to refresh data
                    </p>
                  </div>
                  <Button color="zinc" onClick={handleSoftRefresh} className="ml-4">
                    Quick Refresh
                  </Button>
                </div>
              </div>

              {/* Individual Cache Items Section */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Long-Term Cache Items</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Only refresh specific items when you notice they need updating. The "cases" cache may need more frequent updates.
                </p>
                {cacheLoading ? (
                  <div className="mt-4 text-center text-gray-500">Loading cache items...</div>
                ) : cacheData?.cache && cacheData.cache.length > 0 ? (
                  <div className="mt-4">
                    <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                      {cacheData.cache.map((item: { key: string, createdAt: string }) => (
                        <li key={item.key} className={`flex items-center justify-between p-4 hover:bg-gray-50 ${item.key.includes('cases') ? 'bg-blue-50' : ''}`}>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.key}
                              {item.key.includes('cases') && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                  Frequently updated
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Last updated: {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Button 
                            color="sky"
                            onClick={() => handleCacheItemInvalidation(item.key)}
                            disabled={invalidateLoading}
                            className="ml-4"
                          >
                            {invalidateLoading ? 'Refreshing...' : 'Refresh Item'}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4 text-center text-gray-500">No cache items found</div>
                )}
              </div>

              {/* Hard Refresh Section */}
              <div className="p-6 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Full System Refresh</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Complete system-wide cache reset and rebuild.
                    </p>
                    <p className="mt-2 text-sm font-medium text-red-700">
                      ⚠️ Only use in extreme cases when data inconsistencies are suspected
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button color="red" disabled={refreshLoading} className="ml-4">
                        {refreshLoading ? 'Refreshing...' : 'Full Refresh'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Confirm Full System Refresh</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>This action will:</p>
                          <ul className="list-disc pl-4 text-sm">
                            <li>Clear ALL system caches</li>
                            <li>Rebuild cache data from scratch</li>
                            <li>Temporarily impact system performance</li>
                          </ul>
                          <p className="font-medium text-red-600">
                            Are you sure there are data inconsistencies that require this extreme measure?
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleHardRefresh} className="bg-red-600 hover:bg-red-700">
                          Proceed with Refresh
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {error && (
              <div className="border-t border-gray-200 bg-red-50 p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-700">Error: {error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-amber-800">Important Notice</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    In most cases, a quick refresh is all you need. Long-term cache items should only be refreshed when specific updates are needed, with "cases" being an exception that may need more frequent updates. Full system refresh should be used only when investigating data inconsistencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}