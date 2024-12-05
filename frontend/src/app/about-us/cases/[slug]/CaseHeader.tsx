import React from "react";
import { Heading } from "@/components/catalyst/heading";

interface CaseHeaderProps {
  caseItem: {
    client?: {
      logoUrl?: string;
      name?: string;
    };
    title: string;
    sponsor: string;
    startOfContract?: string;
    endOfContract?: string;
    weeklyApprovedHours?: number;
    preContractedValue?: boolean;
    isActive: boolean;
    tracker?: {
      id: string;
      name: string;
    }[];
    name: string;
    ontologyUrl?: string;
  };
}

export function CaseHeader({ caseItem }: CaseHeaderProps) {
  return (
    <div className="bg-white">
      <div className="flex items-center">
        {caseItem.client?.logoUrl && (
          <div className="flex items-center justify-center h-full mr-8 border-r pr-8 border-gray-200">
            <img
              src={caseItem.client.logoUrl}
              alt={`${caseItem.client.name} logo`}
              className="w-40 h-20 object-contain flex-shrink-0"
            />
          </div>
        )}
        <div className="flex flex-col flex-grow space-y-3">
          <div>
            <div className="flex flex-col lg:max-w-[80%]">
              <Heading className="text-2xl font-bold text-gray-900">{caseItem.title}</Heading>
              {caseItem.ontologyUrl && (
                <span className="text-xs mt-2">
                  <a
                    href={caseItem.ontologyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    View Ontology
                  </a>
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-gray-700 flex items-center">
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {caseItem.sponsor}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-gray-700 flex items-center">
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {caseItem.startOfContract && (
                    <span className="text-green-600 font-medium">
                      {new Date(caseItem.startOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {caseItem.startOfContract && caseItem.endOfContract && <span className="mx-2">→</span>}
                  {caseItem.endOfContract && (
                    <span className="text-red-600 font-medium">
                      {new Date(caseItem.endOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </span>
              </p>
              {caseItem.weeklyApprovedHours && (
                <div className="flex items-center text-gray-600">
                  <span className="mx-2">•</span>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{caseItem.weeklyApprovedHours}h/week {caseItem.preContractedValue && <span className="text-xs text-gray-500">(pre-contracted)</span>}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
            <span className={`px-3 py-1.5 rounded-md font-medium flex items-center ${caseItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${caseItem.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {caseItem.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}