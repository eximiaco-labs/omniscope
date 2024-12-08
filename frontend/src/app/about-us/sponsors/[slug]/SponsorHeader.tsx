import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading } from "@/components/catalyst/heading";

interface SponsorHeaderProps {
  sponsor: {
    name: string;
    photoUrl: string;
    jobTitle: string;
    linkedinUrl: string;
    client: {
      id: string;
      name: string;
    };
  };
}

export function SponsorHeader({ sponsor }: SponsorHeaderProps) {
  return (
    <div className="bg-white p-6 mb-8">
      <div className="flex items-center">
        <div className="flex items-center justify-center h-full mr-8 border-r pr-8 border-gray-200">
          <Avatar className="w-24 h-24">
            <AvatarImage src={sponsor.photoUrl} alt={sponsor.name} />
            <AvatarFallback>{sponsor.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col flex-grow space-y-3">
          <div>
            <div className="flex flex-col lg:max-w-[80%]">
              <span className="text-sm font-medium text-gray-500 mb-1 uppercase">{sponsor.client.name}</span>
              <Heading className="text-2xl font-bold text-gray-900">{sponsor.name}</Heading>
              <p className="text-gray-600">{sponsor.jobTitle}</p>
              {sponsor.linkedinUrl && (
                <span className="text-xs mt-2">
                  <a
                    href={sponsor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    View LinkedIn
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}