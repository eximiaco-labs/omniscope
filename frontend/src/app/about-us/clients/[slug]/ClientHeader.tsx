import React from "react";
import Image from "next/image";
import { Badge } from "@/components/catalyst/badge";

interface ClientHeaderProps {
  client: {
    name: string;
    logoUrl: string;
    isStrategic: boolean;
  };
}

export function ClientHeader({ client }: ClientHeaderProps) {

  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm">
      <div className="relative w-32 h-32">
        <Image
          src={client.logoUrl}
          alt={`${client.name} logo`}
          layout="fill"
          objectFit="contain"
        />
      </div>
      
      <div className="flex-1 p-6">
        <div className="flex items-center gap-3">
          {client.isStrategic && (
            <Badge color="amber">Strategic</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
