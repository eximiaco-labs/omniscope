"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Calendar } from "lucide-react";

interface WeekData {
  week: string;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
}

interface ClientData {
  totalHours: number;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
  weeklyApprovedHours?: number;
  byWeek?: WeekData[];
}

interface ClientCardProps {
  client: {
    slug: string;
    name: string;
    logoUrl: string;
    timesheet: {
      summary: {
        totalHours: number;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      };
      byWeek: {
        data: WeekData[];
      };
    };
  };
  clientData?: ClientData;
}

const getBadgeColor = (type: string): string => {
  switch (type) {
    case "consulting":
      return "amber";
    case "handsOn":
      return "violet";
    case "squad":
      return "blue";
    case "internal":
      return "emerald";
    default:
      return "zinc";
  }
};

const formatHours = (hours: number): string => {
  return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
};

export default function ClientCard({ client, clientData }: ClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderWeeklyData = (data: WeekData | null) => {
    if (!data) return null;

    const hasWork = data.totalConsultingHours > 0 || 
                   data.totalHandsOnHours > 0 || 
                   data.totalSquadHours > 0 || 
                   data.totalInternalHours > 0;

    if (!hasWork) return null;

    return (
      <div className="flex flex-col gap-0.5 mt-0.5">
        {data.totalConsultingHours > 0 && (
          <div className={`text-${getBadgeColor("consulting")}-500 text-[9px]`}>
            {formatHours(data.totalConsultingHours)}
          </div>
        )}
        {data.totalHandsOnHours > 0 && (
          <div className={`text-${getBadgeColor("handsOn")}-500 text-[9px]`}>
            {formatHours(data.totalHandsOnHours)}
          </div>
        )}
        {data.totalSquadHours > 0 && (
          <div className={`text-${getBadgeColor("squad")}-500 text-[9px]`}>
            {formatHours(data.totalSquadHours)}
          </div>
        )}
        {data.totalInternalHours > 0 && (
          <div className={`text-${getBadgeColor("internal")}-500 text-[9px]`}>
            {formatHours(data.totalInternalHours)}
          </div>
        )}
      </div>
    );
  };

  const hasAnyWork = clientData?.byWeek?.some(week => 
    week.totalConsultingHours > 0 || 
    week.totalHandsOnHours > 0 || 
    week.totalSquadHours > 0 || 
    week.totalInternalHours > 0
  );

  return (
    <Link
      href={`/about-us/clients/${client.slug}`}
      className="block transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`h-full ${
          isHovered ? "shadow-lg scale-105" : "shadow"
        } transition-all duration-300 relative`}
      >
        <CardContent className="flex flex-col items-center p-4">
          <div className="w-full h-32 relative mb-2">
            <Image
              src={client.logoUrl}
              alt={`${client.name} logo`}
              layout="fill"
              objectFit="contain"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          </div>
          <h3 className="text-center font-medium text-gray-800 mb-2">{client.name}</h3>
          {clientData && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {clientData.totalConsultingHours > 0 && (
                <Badge variant="outline" className={`bg-amber-500/10 text-amber-500 border-amber-500/20`}>
                  {formatHours(clientData.totalConsultingHours)}h
                </Badge>
              )}
              {clientData.totalHandsOnHours > 0 && (
                <Badge variant="outline" className={`bg-violet-500/10 text-violet-500 border-violet-500/20`}>
                  {formatHours(clientData.totalHandsOnHours)}h
                </Badge>
              )}
              {clientData.totalSquadHours > 0 && (
                <Badge variant="outline" className={`bg-blue-500/10 text-blue-500 border-blue-500/20`}>
                  {formatHours(clientData.totalSquadHours)}h
                </Badge>
              )}
              {clientData.totalInternalHours > 0 && (
                <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>
                  {formatHours(clientData.totalInternalHours)}h
                </Badge>
              )}
            </div>
          )}
          {clientData?.byWeek && hasAnyWork && (
            <div className="mt-2 w-full">
              <div className="flex justify-between text-[9px] text-gray-600">
                {[
                  ...Array.from({ length: 6 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - date.getDay() - 7 * (6 - i));
                    return date.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    });
                  }),
                  "AVG",
                ].map((date, index) => {
                  const weekData =
                    index < 6
                      ? clientData?.byWeek?.find((week) =>
                          week.week.startsWith(date)
                        )
                      : null;

                  const averageData =
                    index === 6 && clientData.byWeek
                      ? ({
                          totalConsultingHours:
                            clientData.byWeek.reduce(
                              (sum, week) => sum + week.totalConsultingHours,
                              0
                            ) / 6,
                          totalHandsOnHours:
                            clientData.byWeek.reduce(
                              (sum, week) => sum + week.totalHandsOnHours,
                              0
                            ) / 6,
                          totalSquadHours:
                            clientData.byWeek.reduce(
                              (sum, week) => sum + week.totalSquadHours,
                              0
                            ) / 6,
                          totalInternalHours:
                            clientData.byWeek.reduce(
                              (sum, week) => sum + week.totalInternalHours,
                              0
                            ) / 6,
                        } as WeekData)
                      : null;

                  const data = index < 6 ? weekData || null : averageData;

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <span>{date}</span>
                      {renderWeeklyData(data)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {clientData?.totalConsultingHours == 0 ?
            <></>
            :
            clientData?.weeklyApprovedHours == undefined ? (<></>) :
            (
              clientData?.weeklyApprovedHours > 0 ?
              <div className="mt-2 text-xs text-center">
                <p className="text-gray-600">Weekly Approved Hours: {clientData.weeklyApprovedHours}</p>
              </div>
              :
              <></>
            )
          }
        </CardContent>
      </Card>
    </Link>
  );
}
