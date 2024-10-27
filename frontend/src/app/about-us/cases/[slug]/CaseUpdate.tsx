import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CaseUpdateProps {
  lastUpdate: {
    author: string;
    date: string;
    status: string;
    observations: string;
  };
}

export function CaseUpdate({ lastUpdate }: CaseUpdateProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string): "zinc" | "rose" | "amber" | "lime" => {
    switch (status) {
      case "Critical": return "rose";
      case "Requires attention": return "amber";
      case "All right": return "lime";
      default: return "zinc";
    }
  };

  function isOlderThan30Days(date: string) {
    if (!date) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(date) < thirtyDaysAgo;
  }

  const statusColor = getStatusColor(lastUpdate.status);

  return (
    <Card className={`mt-4 relative border-2 ${
      statusColor === 'rose' ? 'border-rose-500' : 
      statusColor === 'amber' ? 'border-amber-500' : 
      statusColor === 'lime' ? 'border-lime-500' : 
      'border-zinc-500'
    }`}>
      <CardHeader
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer border-b"
      >
        <CardTitle>Last Update</CardTitle>
        <p className="text-xs text-gray-500">
          By {lastUpdate.author} on {new Date(lastUpdate.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {isOlderThan30Days(lastUpdate.date) && (
            <span className="ml-2 text-red-500 font-semibold">(Older than 30 days)</span>
          )}
        </p>
        <div className="absolute top-4 right-4">
          <Badge color={statusColor}>
            {lastUpdate.status}
          </Badge>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="border-b">
              <div 
                style={{
                  fontSize: '0.9rem',
                  color: '#666',
                }}
                dangerouslySetInnerHTML={{ __html: lastUpdate.observations }} 
              />
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      <CardFooter 
        className="flex justify-center py-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </CardFooter>
    </Card>
  );
}
