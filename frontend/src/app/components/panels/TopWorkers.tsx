import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import RankingIndicator from "@/components/RankingIndicator";
import { ChevronDown, ChevronUp } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface TopWorkersProps {
  workerData?: any[] | null;
  selectedStat?: string | null;
  totalHours?: number | null;
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

const TopWorkers: React.FC<TopWorkersProps> = ({ workerData, selectedStat, totalHours }) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setAnimationTrigger(prev => prev + 1);
  }, [workerData, selectedStat]);

  const filterItems = (item: any) => {
    if (!selectedStat || selectedStat === "allClients" || selectedStat === "total") return true;
    return item.byKind && item.byKind[selectedStat] && item.byKind[selectedStat].totalHours > 0;
  };

  const sortItems = (a: any, b: any) => {
    const getRelevantHours = (item: any) => {
      if (!selectedStat || selectedStat === "allClients" || selectedStat === "total") {
        return item.totalHours;
      }
      return item.byKind && item.byKind[selectedStat] ? item.byKind[selectedStat].totalHours : 0;
    };
    return getRelevantHours(b) - getRelevantHours(a);
  };

  const getItemValue = (item: any, field: string) => {
    if (!selectedStat || selectedStat === "allClients" || selectedStat === "total") {
      return item[field] || 0;
    }
    return item.byKind && item.byKind[selectedStat] ? item.byKind[selectedStat][field] || 0 : 0;
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? Math.floor(hours) : hours.toFixed(1);
  };

  const calculatePercentage = (itemHours: number) => {
    return totalHours && totalHours > 0 ? ((itemHours / totalHours) * 100).toFixed(1) : "0.0";
  };

  const filteredWorkers = workerData ? workerData.filter(filterItems).sort(sortItems).slice(0, 10) : [];
  const displayedWorkers = expanded ? filteredWorkers : filteredWorkers.slice(0, 3);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const getTitle = () => {
    if (!workerData || filteredWorkers.length === 0) {
      return "Workers";
    }
    if (!expanded) {
      return filteredWorkers.length > 3 ? "Top 3 Workers" : "Workers";
    } else {
      return filteredWorkers.length < 10 ? "Workers" : "Top 10 Workers";
    }
  };

  return (
    <div>
      <style>{fadeInAnimation}</style>
      <SectionHeader title={getTitle()} subtitle="" />

      {!workerData || filteredWorkers.length === 0 ? (
        <p className="text-center text-gray-500">No worker data available</p>
      ) : (
        <>
          <Table className="w-full table-fixed">
            <TableHead>
              <TableRow>
                <TableHeader className="w-[50px] text-center">#</TableHeader>
                <TableHeader className="w-8/12">Worker</TableHeader>
                <TableHeader className="w-4/12">Hours</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedWorkers.map((worker: any, index: number) => (
                <TableRow
                  key={`${worker.name}-${animationTrigger}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="text-center text-gray-500 text-[10px]">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span>{worker.name}</span>
                        <span className="text-xs text-gray-500">
                          {getItemValue(worker, 'uniqueClients')} clients • {getItemValue(worker, 'uniqueCases')} cases
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {formatHours(getItemValue(worker, 'totalHours'))}
                      <span className="text-xs text-gray-500">
                        {calculatePercentage(getItemValue(worker, 'totalHours'))}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredWorkers.length > 3 && (
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

export default TopWorkers;
