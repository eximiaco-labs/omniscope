"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_CASE_BY_SLUG } from "./queries";
import { CaseHeader } from "./CaseHeader";

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
      {caseItem.lastUpdate && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Last Update</h2>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(caseItem.lastUpdate.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Author:</strong> {caseItem.lastUpdate.author}
          </p>
          <p>
            <strong>Status:</strong> {caseItem.lastUpdate.status}
          </p>
          <p>
            <strong>Observations:</strong> {caseItem.lastUpdate.observations}
          </p>
        </div>
      )}
    </div>
  );
}
