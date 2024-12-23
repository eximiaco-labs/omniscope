import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";

import { ChevronDown, ChevronUp } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface TopSponsorsProps {
  sponsorData: any[] | null;
  selectedStat: string;
  totalHours: number;
}

const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TopSponsors: React.FC<TopSponsorsProps> = ({
  sponsorData,
  selectedStat,
  totalHours,
}) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setAnimationTrigger((prev) => prev + 1);
  }, [sponsorData, selectedStat]);

  const filterItems = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") return true;
    return item.byKind?.[selectedStat]?.totalHours > 0;
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
    ? sponsorData
        .filter(filterItems)
        .sort(sortItems)
        .slice(0, 10)
    : [];

  const displayedSponsors = expanded ? filteredSponsors : filteredSponsors.slice(0, 3);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const getTitle = () => {
    if (!sponsorData || filteredSponsors.length === 0) {
      return "Sponsors";
    }
    if (!expanded) {
      return filteredSponsors.length > 3 ? "Top 3 Sponsors" : "Sponsors";
    } else {
      return filteredSponsors.length < 10 ? "Sponsors" : "Top 10 Sponsors";
    }
  };

  return (
    <div>
      <style>{fadeInAnimation}</style>
      <SectionHeader title={getTitle()} subtitle="" />

      {!sponsorData || filteredSponsors.length === 0 ? (
        <p className="text-center text-gray-500">No sponsor data available</p>
      ) : (
        <>
          <Table className="w-full table-fixed">
            <TableHead>
              <TableRow>
                <TableHeader className="w-[50px] text-center">#</TableHeader>
                <TableHeader className="w-8/12">
                  Sponsor
                </TableHeader>
                <TableHeader className="w-4/12">
                  Hours
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedSponsors.map((sponsor: any, index: number) => (
                <TableRow
                  key={`${sponsor.name}-${animationTrigger}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* <RankingIndicator
                        index={index + 1}
                        percentage={calculatePercentage(
                          getItemValue(sponsor, "totalHours")
                        )}
                      /> */}
                      <div className="flex flex-col">
                        <span>{sponsor.name}</span>
                        <span className="text-xs text-gray-500">
                          {getItemValue(sponsor, "uniqueCases")} case(s)
                          {getItemValue(sponsor, "uniqueWorkers") > 1 && ` • ${getItemValue(sponsor, "uniqueWorkers")} workers`}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {formatHours(getItemValue(sponsor, "totalHours"))}
                      <span className="text-xs text-gray-500">
                        {calculatePercentage(getItemValue(sponsor, "totalHours"))}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSponsors.length > 3 && (
            <div className="mt-4">
              <button
                onClick={toggleExpand}
                className="flex items-center justify-center w-full py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show More
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopSponsors;
