import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import RankingIndicator from "@/components/RankingIndicator";

interface TopSponsorsProps {
  sponsorData: any[];
  selectedStat: string;
  totalHours: number;
}

const TopSponsors: React.FC<TopSponsorsProps> = ({
  sponsorData,
  selectedStat,
  totalHours,
}) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);

  useEffect(() => {
    setAnimationTrigger((prev) => prev + 1);
  }, [sponsorData, selectedStat]);

  const filterItems = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") return true;
    return item.byKind[selectedStat].totalHours > 0;
  };

  const sortItems = (a: any, b: any) => {
    const getRelevantHours = (item: any) => {
      if (selectedStat === "allClients" || selectedStat === "total") {
        return item.totalHours;
      }
      return item.byKind[selectedStat].totalHours;
    };
    return getRelevantHours(b) - getRelevantHours(a);
  };

  const getItemValue = (item: any, field: string) => {
    if (selectedStat === "allClients" || selectedStat === "total") {
      return item[field];
    }
    return item.byKind[selectedStat][field];
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? Math.floor(hours) : hours.toFixed(1);
  };

  const calculatePercentage = (itemHours: number) => {
    return totalHours > 0 ? ((itemHours / totalHours) * 100).toFixed(1) : "0.0";
  };

  const filteredSponsors = sponsorData
    .filter(filterItems)
    .sort(sortItems)
    .slice(0, 10);

  return (
    <div>
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {filteredSponsors.length < 10 ? "Sponsors" : "Top 10 Sponsors"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full table-fixed">
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableHeader className="font-semibold text-left w-8/12">
                  Sponsor
                </TableHeader>
                <TableHeader className="font-semibold text-center w-4/12">
                  Hours
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSponsors.map((sponsor: any, index: number) => (
                <TableRow
                  key={`${sponsor.name}-${animationTrigger}`}
                  className={`animate-fadeIn hover:bg-gray-50 transition-all duration-300 ease-in-out ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`,
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <RankingIndicator
                        index={index + 1}
                        percentage={calculatePercentage(
                          getItemValue(sponsor, "totalHours")
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="transition-all duration-300 ease-in-out">
                          {sponsor.name}
                        </span>
                        <span className="text-xs text-gray-500 transition-all duration-300 ease-in-out">
                          {getItemValue(sponsor, "uniqueCases")} cases •{" "}
                          {getItemValue(sponsor, "uniqueWorkers")} workers
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium transition-all duration-300 ease-in-out">
                      {formatHours(getItemValue(sponsor, "totalHours"))}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopSponsors;
