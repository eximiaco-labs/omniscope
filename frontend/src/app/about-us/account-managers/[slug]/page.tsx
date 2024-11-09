"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ACCOUNT_MANAGER, AccountManager } from "./queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { TimesheetSummary } from "./TimesheetSummary";

export default function AccountManagerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDataset, setSelectedDataset] = useState("timesheet-last-six-weeks");

  const { data, loading, error } = useQuery<{ accountManager: AccountManager }>(
    GET_ACCOUNT_MANAGER,
    {
      variables: { 
        slug,
        dataset: selectedDataset.replace('timesheet-', '')
      }
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.accountManager) return <div>Manager not found</div>;

  const { name, position, photoUrl } = data.accountManager;

  return (
    <div className="w-full p-2">
      <header className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600">{position}</p>
        </div>
      </header>

      <TimesheetSummary 
        timesheet={data.accountManager.timesheet}
        selectedDataset={selectedDataset}
        onDatasetSelect={setSelectedDataset}
      />
    </div>
  );
}
