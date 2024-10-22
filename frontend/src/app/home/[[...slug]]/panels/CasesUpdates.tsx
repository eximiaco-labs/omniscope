import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/catalyst/badge";

interface CasesUpdatesProps {
  caseData: any[];
  selectedStat: string;
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

const CasesUpdates: React.FC<CasesUpdatesProps> = ({
  caseData,
  selectedStat,
}) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setAnimationTrigger((prev) => prev + 1);
  }, [caseData, selectedStat]);

  const filterItems = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") return true;
    const relevantHours =
      item[
        `total${
          selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1)
        }Hours`
      ];
    return relevantHours > 0;
  };

  const sortCases = (a: any, b: any) => {
    if (!a.caseDetails.lastUpdate || !a.caseDetails.lastUpdate.date) return -1;
    if (!b.caseDetails.lastUpdate || !b.caseDetails.lastUpdate.date) return 1;
    return (
      new Date(a.caseDetails.lastUpdate.date).getTime() -
      new Date(b.caseDetails.lastUpdate.date).getTime()
    );
  };

  const getStatusColor = (
    status: string
  ): "zinc" | "rose" | "amber" | "lime" => {
    switch (status) {
      case "Critical":
        return "rose";
      case "Requires attention":
        return "amber";
      case "All right":
        return "lime";
      default:
        return "zinc";
    }
  };

  const getDaysSinceUpdate = (updateDate: string | null) => {
    if (!updateDate) return null;
    const update = new Date(updateDate);
    const today = new Date();
    const diffTime = today.getTime() - update.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAndSortedCases = caseData.filter(filterItems).sort(sortCases);
  const displayedCases = expanded
    ? filteredAndSortedCases
    : filteredAndSortedCases.slice(0, 3);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <style>{fadeInAnimation}</style>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Cases Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableHeader className="font-semibold text-left">
                  Case
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedCases.map((caseItem: any, index: number) => {
                const daysSinceUpdate = getDaysSinceUpdate(
                  caseItem.caseDetails.lastUpdate?.date
                );
                return (
                  <TableRow
                    key={`${caseItem.title}-${animationTrigger}`}
                    className={`hover:bg-gray-50 transition-all duration-300 ease-in-out ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                    style={{
                      animation: `fadeIn 0.5s ease-out ${
                        index * 50
                      }ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <p className="font-bold uppercase text-xs">
                          {caseItem.caseDetails?.client?.name ||
                            "Unknown Client"}
                        </p>
                        <p
                          className="text-base whitespace-normal break-words"
                          title={caseItem.title}
                        >
                          {caseItem.title}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          {caseItem.caseDetails.lastUpdate ? (
                            <Badge
                              color={getStatusColor(
                                caseItem.caseDetails.lastUpdate.status
                              )}
                            >
                              {caseItem.caseDetails.lastUpdate.status}
                            </Badge>
                          ) : <></> }
                          <div className="flex flex-col items-end">
                            {caseItem.caseDetails.lastUpdate ? (
                              <>
                                {daysSinceUpdate !== null && (
                                  <span
                                    className={`text-xs ${
                                      daysSinceUpdate > 30
                                        ? "text-red-500 font-semibold"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {daysSinceUpdate} days since last update
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-red-500">
                                No update information
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredAndSortedCases.length > 3 && (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CasesUpdates;
