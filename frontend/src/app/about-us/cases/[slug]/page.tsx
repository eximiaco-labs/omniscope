"use client";

import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { GET_CASE_BY_SLUG } from '../queries';
import { Heading } from "@/components/catalyst/heading";

export default function CasePage() {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_CASE_BY_SLUG, {
    variables: { slug },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const caseItem = data.case;

  return (
    <div className="container mx-auto p-4">
      <Heading level={1} className="mb-4">{caseItem.title}</Heading>
      <p className="mb-2"><strong>Client:</strong> {caseItem.client?.name}</p>
      <p className="mb-2"><strong>Sponsor:</strong> {caseItem.sponsor}</p>
      <p className="mb-2"><strong>Status:</strong> {caseItem.isActive ? 'Active' : 'Inactive'}</p>
      {caseItem.startOfContract && (
        <p className="mb-2"><strong>Start of Contract:</strong> {new Date(caseItem.startOfContract).toLocaleDateString()}</p>
      )}
      {caseItem.endOfContract && (
        <p className="mb-2"><strong>End of Contract:</strong> {new Date(caseItem.endOfContract).toLocaleDateString()}</p>
      )}
      <p className="mb-2"><strong>Weekly Approved Hours:</strong> {caseItem.weeklyApprovedHours}</p>
      {caseItem.lastUpdate && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Last Update</h2>
          <p><strong>Date:</strong> {new Date(caseItem.lastUpdate.date).toLocaleDateString()}</p>
          <p><strong>Author:</strong> {caseItem.lastUpdate.author}</p>
          <p><strong>Status:</strong> {caseItem.lastUpdate.status}</p>
          <p><strong>Observations:</strong> {caseItem.lastUpdate.observations}</p>
        </div>
      )}
    </div>
  );
}
