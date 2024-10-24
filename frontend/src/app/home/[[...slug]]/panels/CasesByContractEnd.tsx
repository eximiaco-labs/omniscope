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

interface CasesByContractEndProps {
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

const CasesByContractEnd: React.FC<CasesByContractEndProps> = ({ caseData, selectedStat }) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setAnimationTrigger(prev => prev + 1);
  }, [caseData, selectedStat]);

  const filterItems = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") return true;
    const relevantHours = item[`total${selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1)}Hours`];
    return relevantHours > 0;
  };

  const sortCases = (a: any, b: any) => {
    if (!a.caseDetails.endOfContract) return -1;
    if (!b.caseDetails.endOfContract) return 1;
    return new Date(a.caseDetails.endOfContract).getTime() - new Date(b.caseDetails.endOfContract).getTime();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not defined";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRelevantHours = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") {
      return item.totalHours;
    }
    return item[`total${selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1)}Hours`];
  };

  const filteredAndSortedCases = caseData?.filter(filterItems).sort(sortCases);
  const displayedCases = expanded ? filteredAndSortedCases : filteredAndSortedCases?.slice(0, 3);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <style>{fadeInAnimation}</style>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Near to End
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableHeader className="font-semibold text-left">Case</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedCases?.map((caseItem: any, index: number) => {
                const daysRemaining = getDaysRemaining(caseItem.caseDetails.endOfContract);
                return (
                  <TableRow 
                    key={`${caseItem.title}-${animationTrigger}`}
                    className={`hover:bg-gray-50 transition-all duration-300 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    style={{ 
                      animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <p className="font-bold uppercase text-xs">{caseItem.caseDetails?.client?.name || 'Unknown Client'}</p>
                        <p className="text-base whitespace-normal break-words" title={caseItem.title}>
                          {caseItem.title}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          {caseItem.caseDetails.weeklyApprovedHours ? (
                            <span className="text-gray-600">
                              {caseItem.caseDetails.weeklyApprovedHours} hours/week
                            </span>
                          ) : (
                            <span className="text-red-500">
                              No weekly hours defined.
                            </span>
                          )}
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {formatDate(caseItem.caseDetails.endOfContract)}
                            </span>
                            {daysRemaining !== null && (
                              <span className={`text-xs ${daysRemaining < 30 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                                {daysRemaining} days remaining
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
          {filteredAndSortedCases?.length > 3 && (
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

export default CasesByContractEnd;
