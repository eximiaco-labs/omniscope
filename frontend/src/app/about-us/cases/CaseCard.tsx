import React, { useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";
import { AlertTriangle, Calendar, CalendarCheck } from 'lucide-react';

interface CaseCardProps {
  caseItem: any;
  caseData: any;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem, caseData }) => {
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

  const getStatusColor = (status: string) => {
    const statusColor: { [key: string]: string } = {
      "Critical": "rose",
      "Requires attention": "amber",
      "All right": "lime"
    };
    return statusColor[status] || "zinc";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Link 
      href={`/analytics/datasets/timesheet-last-six-weeks?CaseTitle=${encodeURIComponent(caseItem.title)}`}
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
            {caseItem.sponsor && (
              <div className="text-xs text-gray-600 mt-1">
                {caseItem.sponsor}
              </div>
            )}
          </div>
          <CardHeader className="p-0 mt-2">
            <CardTitle className={`text-center text-sm transition-all duration-300`}>
              {caseItem.title}
            </CardTitle>
          </CardHeader>
          {!caseItem.hasDescription && caseItem.everhourProjectsIds && (
            <div className="mt-2">
              <Badge color="red" className="text-xs">
                {caseItem.everhourProjectsIds.join(', ')}
              </Badge>
            </div>
          )}
          {caseData && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {caseData.totalConsultingHours > 0 && (
                <Badge color={getBadgeColor('consulting')}>
                  {caseData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {caseData.totalHandsOnHours > 0 && (
                <Badge color={getBadgeColor('handsOn')}>
                  {caseData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {caseData.totalSquadHours > 0 && (
                <Badge color={getBadgeColor('squad')}>
                  {caseData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {caseData.totalInternalHours > 0 && (
                <Badge color={getBadgeColor('internal')}>
                  {caseData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
            </div>
          )}
          <div className="mt-2 text-xs text-gray-600 text-center">
            {caseItem.weeklyApprovedHours > 0 && (
              <p>Weekly Approved Hours: {caseItem.weeklyApprovedHours}</p>
            )}
          </div>
          {caseItem.lastUpdate && (
            <div className="mt-2 text-[10px] text-gray-600 text-center">
              <p>Updated on {formatDate(caseItem.lastUpdate.date)} by {caseItem.lastUpdate.author}</p>
              <div className="flex justify-center mt-1">
                <Badge color={getStatusColor(caseItem.lastUpdate.status)}>
                  {caseItem.lastUpdate.status}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
