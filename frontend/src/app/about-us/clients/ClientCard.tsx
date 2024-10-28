"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";
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
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
  weeklyApprovedHours?: number;
  byWeek?: WeekData[];
}

interface ClientCardProps {
  client: {
    name: string;
    logoUrl: string;
  };
  clientData?: ClientData;
}

const getBadgeColor = (type: string) => {
  switch (type) {
    case "consulting":
      return "amber";
    case "handsOn":
      return "purple";
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

    return (
      <div className="flex flex-col gap-0.5 mt-0.5">
        {data.totalConsultingHours > 0 && (
          <div className="text-amber-500 text-[9px]">
            {formatHours(data.totalConsultingHours)}
          </div>
        )}
        {data.totalHandsOnHours > 0 && (
          <div className="text-purple-500 text-[9px]">
            {formatHours(data.totalHandsOnHours)}
          </div>
        )}
        {data.totalSquadHours > 0 && (
          <div className="text-blue-500 text-[9px]">
            {formatHours(data.totalSquadHours)}
          </div>
        )}
        {data.totalInternalHours > 0 && (
          <div className="text-emerald-500 text-[9px]">
            {formatHours(data.totalInternalHours)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Link
      href={`/analytics/datasets/timesheet-last-six-weeks?ClientName=${encodeURIComponent(
        client.name
      )}`}
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
          {clientData && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {clientData.totalConsultingHours > 0 && (
                <Badge color={getBadgeColor("consulting")}>
                  {formatHours(clientData.totalConsultingHours)}h
                </Badge>
              )}
              {clientData.totalHandsOnHours > 0 && (
                <Badge color={getBadgeColor("handsOn")}>
                  {formatHours(clientData.totalHandsOnHours)}h
                </Badge>
              )}
              {clientData.totalSquadHours > 0 && (
                <Badge color={getBadgeColor("squad")}>
                  {formatHours(clientData.totalSquadHours)}h
                </Badge>
              )}
              {clientData.totalInternalHours > 0 && (
                <Badge color={getBadgeColor("internal")}>
                  {formatHours(clientData.totalInternalHours)}h
                </Badge>
              )}
            </div>
          )}
          {clientData?.byWeek && (
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
                      ? clientData.byWeek.find((week) =>
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
