"use client";

import { useParams } from "next/navigation";
import { ConsultantHeader } from "./ConsultantHeader";
import { ConsultantCasesStatusOverview } from "./ConsultantCasesStatusOverview";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import { ApolloProvider } from "@apollo/client";
import OneYearAllocation from "@/app/components/OneYearAllocation";

export default function ConsultantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const client = useEdgeClient();

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <ApolloProvider client={client}>
      <div className="w-full">
        <ConsultantHeader slug={slug} />
        <ConsultantCasesStatusOverview slug={slug} />
        <OneYearAllocation workerName={slug} />
      </div>
    </ApolloProvider>
  );
} 