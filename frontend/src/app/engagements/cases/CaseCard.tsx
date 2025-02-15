import React, { useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";
import { AlertTriangle, Calendar, CalendarCheck } from 'lucide-react';

interface Update {
  date: string;
  status: string;
  author: string;
}

interface TimesheetSummary {
  totalHours: number;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
}

interface WeekData {
  week: string;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
}

interface Timesheet {
  summary: TimesheetSummary;
  byWeek: {
    data: WeekData[];
  };
}

interface Case {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  preContractedValue: boolean;
  sponsor: {
    name: string;
  };
  hasDescription: boolean;
  startOfContract: string;
  endOfContract: string;
  weeklyApprovedHours: number;
  client: {
    name: string;
  };
  isStale: boolean;
  updates: {
    data: Update[];
  };
  timesheet: Timesheet;
}

interface CaseCardProps {
  caseItem: Case;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'consulting': return 'amber';
      case 'handsOn': return 'purple';
      case 'squad': return 'blue';
      case 'internal': return 'emerald';
      default: return 'zinc';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string): "zinc" | "rose" | "amber" | "lime" => {
    switch (status) {
      case "Critical": return "rose";
      case "Requires attention": return "amber";
      case "All right": return "lime";
      default: return "zinc";
    }
  };

  const timesheetSummary = caseItem.timesheet?.summary;
  const timesheetWeeks = caseItem.timesheet?.byWeek?.data ?? [];
  const lastUpdate = caseItem.updates?.data?.[0];
  console.log('Last update:', lastUpdate); // Temporary debug log

  return (
    <Link 
      href={`/engagements/cases/${caseItem.slug}`}
      className="block transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300 relative`}>
        {!caseItem.hasDescription && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className="bg-red-500 rounded-full p-1">
              <AlertTriangle className="text-white" size={20} />
            </div>
          </div>
        )}
        {caseItem.startOfContract && (
          <div className="absolute top-1 left-1 z-10">
            <div className="flex items-center">
              <Calendar className="text-green-800" size={10} />
              <span className="text-[8px] text-green-800 ml-0.5 font-semibold">{formatDate(caseItem.startOfContract)}</span>
            </div>
          </div>
        )}
        {caseItem.endOfContract && (
          <div className="absolute bottom-1 right-1 z-10">
            <div className="flex items-center">
              <CalendarCheck className="text-red-800" size={10} />
              <span className="text-[8px] text-red-800 ml-0.5 font-semibold">{formatDate(caseItem.endOfContract)}</span>
            </div>
          </div>
        )}
        <CardContent className="flex flex-col items-center p-4 pt-6">
          <div className="w-full mb-1 text-center">
            <h3 className="font-bold uppercase">{caseItem.client?.name || 'Unknown Client'}</h3>
            {caseItem.sponsor?.name && (
              <div className="text-xs text-gray-600 mt-1">
                {caseItem.sponsor.name}
              </div>
            )}
          </div>
          <CardHeader className="p-0 mt-2">
            <CardTitle className={`text-center text-sm transition-all duration-300`}>
              {caseItem.title}
            </CardTitle>
          </CardHeader>
          {timesheetSummary && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {timesheetSummary.totalConsultingHours > 0 && (
                <Badge color={getBadgeColor('consulting')}>
                  {timesheetSummary.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {timesheetSummary.totalHandsOnHours > 0 && (
                <Badge color={getBadgeColor('handsOn')}>
                  {timesheetSummary.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {timesheetSummary.totalSquadHours > 0 && (
                <Badge color={getBadgeColor('squad')}>
                  {timesheetSummary.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {timesheetSummary.totalInternalHours > 0 && (
                <Badge color={getBadgeColor('internal')}>
                  {timesheetSummary.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
            </div>
          )}
          {timesheetWeeks.length > 0 && (
            <div className="mt-2 w-full">
              <div className="flex justify-between text-[9px] text-gray-600">
                {[...Array.from({ length: 6 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() - 7 * (6 - i));
                  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                }), 'AVG'].map((date, index) => {
                  const weekData = index < 6 ? timesheetWeeks.find(week => week.week.startsWith(date)) : null;
                  const averageData = index === 6 ? {
                    totalConsultingHours: timesheetWeeks.reduce((sum, week) => sum + week.totalConsultingHours, 0) / 6,
                    totalHandsOnHours: timesheetWeeks.reduce((sum, week) => sum + week.totalHandsOnHours, 0) / 6,
                    totalSquadHours: timesheetWeeks.reduce((sum, week) => sum + week.totalSquadHours, 0) / 6,
                    totalInternalHours: timesheetWeeks.reduce((sum, week) => sum + week.totalInternalHours, 0) / 6
                  } : null;
                  const data = index < 6 ? weekData : averageData;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <span>{date}</span>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        {(() => {
                          const hours = data?.totalConsultingHours ?? 0;
                          return hours > 0 && (
                            <div className="text-amber-500 text-[9px]">
                              {hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}
                            </div>
                          );
                        })()}
                        {(() => {
                          const hours = data?.totalHandsOnHours ?? 0;
                          return hours > 0 && (
                            <div className="text-purple-500 text-[9px]">
                              {hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}
                            </div>
                          );
                        })()}
                        {(() => {
                          const hours = data?.totalSquadHours ?? 0;
                          return hours > 0 && (
                            <div className="text-blue-500 text-[9px]">
                              {hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}
                            </div>
                          );
                        })()}
                        {(() => {
                          const hours = data?.totalInternalHours ?? 0;
                          return hours > 0 && (
                            <div className="text-emerald-500 text-[9px]">
                              {hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-600 text-center">
            {caseItem.weeklyApprovedHours > 0 && (
              <p>Weekly Approved Hours: {caseItem.weeklyApprovedHours}{caseItem.preContractedValue ? ' (pre)' : ''}</p>
            )}
          </div>
          {lastUpdate && (
            <div className="mt-2 text-[10px] text-gray-600 text-center">
              <p className={`${caseItem.isStale ? 'text-red-500 font-semibold' : ''}`}>
                Updated on {formatDate(lastUpdate.date)} by {lastUpdate.author}
              </p>
              <div className="flex justify-center mt-1">
                <Badge color={getStatusColor(lastUpdate.status)}>
                  {lastUpdate.status}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
