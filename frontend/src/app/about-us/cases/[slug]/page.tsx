"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_CASE_BY_SLUG } from "./queries";
import { CaseHeader } from "./CaseHeader";
import { CaseUpdate } from "./CaseUpdate";

export default function CasePage() {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_CASE_BY_SLUG, {
    variables: { slug },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const caseItem = data.case;

  return (
    <div>
      <CaseHeader caseItem={caseItem} />
      {caseItem.lastUpdate && <CaseUpdate lastUpdate={caseItem.lastUpdate} />}
    </div>
  );
}
