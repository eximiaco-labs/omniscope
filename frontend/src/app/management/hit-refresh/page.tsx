'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/catalyst/button';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { gql, useMutation } from '@apollo/client';
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

export default function HitRefresh() {
  const router = useRouter();
  const [refreshData, { loading, error }] = useMutation(REFRESH_DATA_MUTATION);

  const handleRefresh = async () => {
    try {
      const { data } = await refreshData();
      if (data.refreshData) {
        toast("Cache refresh initiated", {
          description: "The system is now updating. This may take a few moments.",
          action: {
            label: "Dismiss",
            onClick: () => console.log("Toast dismissed"),
          },
        });
        setTimeout(() => router.push('/'), 2000);
      } else {
        toast.error("Failed to refresh data", {
          description: "Please try again later.",
        });
      }
    } catch (err) {
      toast.error("An error occurred", {
        description: "Please try again or contact support if the issue persists.",
      });
      console.error(err);
    }
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Reset System Caches</h1>
        <p className="mt-2 text-lg text-gray-600">
          Refresh your system's data to ensure you have the most up-to-date information.
        </p>
        <div className="mt-8 space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Reset all caches</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  This action will clear all existing caches and fetch the latest data from their sources.
                  It ensures that you're working with the most current information available.
                </p>
              </div>
              <div className="mt-5">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button color="blue" disabled={loading}>
                      {loading ? 'Resetting...' : 'Reset Caches'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will reset all system caches. It may temporarily slow down the system as new cache bases are being built.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRefresh}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">Error: {error.message}</p>
              )}
            </div>
          </div>
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Resetting caches may temporarily slow down the system as new cache bases are being built.
                    Performance will improve once the process is complete.
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