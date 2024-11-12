import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

interface TimelineUpdate {
  author: string;
  date: string;
  status: string;
  observations: string;
}

interface CaseTimelineProps {
  updates: TimelineUpdate[];
}

function getStatusColor(status: string): "zinc" | "rose" | "amber" | "lime" {
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
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Critical":
      return AlertCircle;
    case "Requires attention":
      return AlertTriangle;
    case "All right":
      return CheckCircle2;
    default:
      return Circle;
  }
}

export function CaseTimeline({ updates }: CaseTimelineProps) {
  // Sort updates in chronological order (oldest to newest)
  const sortedUpdates = [...updates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const [selectedUpdate, setSelectedUpdate] = useState<TimelineUpdate | null>(null);
  const [startIndex, setStartIndex] = useState(Math.max(0, sortedUpdates.length - 6));

  // Show only 6 updates at a time
  const visibleUpdates = sortedUpdates.slice(startIndex, startIndex + 6);
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + 6 < sortedUpdates.length;
  const lastUpdate = sortedUpdates[sortedUpdates.length - 1];

  const handleScroll = (direction: 'left' | 'right') => {
    if (direction === 'left' && canScrollLeft) {
      setStartIndex(Math.max(0, startIndex - 1));
    } else if (direction === 'right' && canScrollRight) {
      setStartIndex(Math.min(sortedUpdates.length - 6, startIndex + 1));
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative mx-12">
        <div className="relative flex items-center">
          <button
            onClick={() => handleScroll('left')}
            className={cn(
              "absolute left-0 -translate-x-12 z-10 p-1 rounded-full border bg-white shadow-sm",
              !canScrollLeft && "opacity-50 cursor-not-allowed"
            )}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute h-0.5 bg-zinc-200 left-0 right-0 top-1/2 -translate-y-1/2" />
          <div className="flex gap-8 relative w-full justify-between px-4">
            {visibleUpdates.map((update, index) => {
              const StatusIcon = getStatusIcon(update.status);
              const isSelected = selectedUpdate === update;
              const isLastUpdate = update === lastUpdate;
              return (
                <HoverCard key={index}>
                  <HoverCardTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "text-xs whitespace-nowrap transition-colors duration-200",
                        isSelected ? "text-zinc-900 font-medium" : "text-zinc-500",
                        isLastUpdate && "text-zinc-900 font-bold"
                      )}>
                        {new Date(update.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })}
                      </div>
                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className={cn(
                          "relative flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all duration-200",
                          isSelected ? "scale-110 ring-2 ring-offset-2" : "",
                          isLastUpdate && "scale-125 ring-2 ring-offset-2",
                          getStatusColor(update.status) === "rose"
                            ? "border-rose-300 bg-rose-50 ring-rose-400"
                            : getStatusColor(update.status) === "amber"
                            ? "border-amber-300 bg-amber-50 ring-amber-400"
                            : getStatusColor(update.status) === "lime"
                            ? "border-lime-300 bg-lime-50 ring-lime-400"
                            : "border-zinc-300 bg-zinc-50 ring-zinc-400"
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "h-5 w-5",
                            getStatusColor(update.status) === "rose"
                              ? "text-rose-500"
                              : getStatusColor(update.status) === "amber"
                              ? "text-amber-500"
                              : getStatusColor(update.status) === "lime"
                              ? "text-lime-500"
                              : "text-zinc-500"
                          )}
                        />
                      </button>
                      <div className={cn(
                        "text-xs font-medium whitespace-nowrap transition-colors duration-200",
                        isSelected ? "text-zinc-900" : "text-zinc-700",
                        isLastUpdate && "text-zinc-900 font-bold"
                      )}>
                        {update.author}
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-600">
                        <span className="font-bold text-zinc-900">{update.author}</span>
                        {" "}on{" "}
                        <span className="font-bold">
                          {new Date(update.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                      <div
                        className="prose prose-xs prose-zinc line-clamp-6"
                        dangerouslySetInnerHTML={{ __html: update.observations }}
                      />
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>

          <button
            onClick={() => handleScroll('right')}
            className={cn(
              "absolute right-0 translate-x-12 z-10 p-1 rounded-full border bg-white shadow-sm",
              !canScrollRight && "opacity-50 cursor-not-allowed"
            )}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AlertDialog open={!!selectedUpdate} onOpenChange={() => setSelectedUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span>Update from {selectedUpdate?.author}</span>
              <span className="text-sm font-normal text-zinc-500">
                {selectedUpdate && new Date(selectedUpdate.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div
                className="prose prose-sm prose-zinc mt-2"
                dangerouslySetInnerHTML={{ __html: selectedUpdate?.observations || "" }}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSelectedUpdate(null)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}