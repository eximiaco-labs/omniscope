import React from "react";
import Image from "next/image";
import { Badge } from "@/components/catalyst/badge";
import Link from "next/link";

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
    <div className="flex items-center bg-white rounded-lg shadow-sm">
      <div className="relative w-32 h-32">
        <Image
          src={sponsor.photoUrl}
          alt={`${sponsor.name} photo`}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      
      <div className="flex-1 p-6">
        {sponsor.client && (
          <p className="text-gray-500 mb-2 text-sm font-bold">
            {sponsor.client.name.toUpperCase()}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{sponsor.name}</h1>
          {sponsor.linkedinUrl && (
            <Link href={sponsor.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Badge color="blue">LinkedIn</Badge>
            </Link>
          )}
        </div>
        <p className="text-gray-600 mt-2">{sponsor.jobTitle}</p>
      </div>
    </div>
  );
}