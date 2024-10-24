import React from 'react';
import { motion } from 'framer-motion';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

type TimelinessData = {
  totalRows: number;
  earlyRows: number;
  earlyTimeInHours: number;
  okRows: number;
  okTimeInHours: number;
  acceptableRows: number;
  acceptableTimeInHours: number;
  lateRows: number;
  lateTimeInHours: number;
  earlyWorkers: Array<{
    worker: string;
    entries: number;
    timeInHours: number;
  }>;
  okWorkers: Array<{
    worker: string;
    entries: number;
    timeInHours: number;
  }>;
  acceptableWorkers: Array<{
    worker: string;
    entries: number;
    timeInHours: number;
  }>;
  lateWorkers: Array<{
    worker: string;
    entries: number;
    timeInHours: number;
  }>;
  minDate: string;
  maxDate: string;
};

type TimelinessPanelProps = {
  data: TimelinessData | null;
};

const TimelinessPanel: React.FC<TimelinessPanelProps> = ({ data }) => {
  if (!data) {
    return (
      <motion.div
        className="col-span-3 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-visible mb-4 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      >
        <p>No timeliness data available.</p>
      </motion.div>
    );
  }

  const totalTime = data.earlyTimeInHours + data.okTimeInHours + data.acceptableTimeInHours + data.lateTimeInHours;

  const getPercentage = (value: number) => ((value / totalTime) * 100).toFixed(1);

  const categories = [
    { label: 'Early', hours: data.earlyTimeInHours, color: 'bg-yellow-200', workers: data.earlyWorkers },
    { label: 'On Time', hours: data.okTimeInHours, color: 'bg-green-700', workers: data.okWorkers },
    { label: 'Acceptable', hours: data.acceptableTimeInHours, color: 'bg-yellow-500', workers: data.acceptableWorkers },
    { label: 'Late', hours: data.lateTimeInHours, color: 'bg-red-700', workers: data.lateWorkers },
  ];

  return (
    <motion.div
      className="col-span-3 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-visible mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.9 }}
    >
      {/* Header */}
      <motion.div
        className="p-2 border-b border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm font-bold">
          Timeliness Overview
          <span className="text-xs font-normal text-gray-400 ml-2">
            ({new Date(data.minDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - {new Date(data.maxDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })})
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <div className="w-full h-6 flex rounded-full overflow-hidden">
            {categories.map((category, index) => (
              <HoverCard key={index}>
                <HoverCardTrigger asChild>
                  <div
                    className={`h-full ${category.color} cursor-pointer`}
                    style={{ width: `${getPercentage(category.hours)}%` }}
                  ></div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 z-50 p-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold">{category.label} Workers</h4>
                    <div className="min-w-full text-[9px] leading-tight text-zinc-950 dark:text-white">
                      <div className="flex text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="w-3/5 px-2 py-0.5 font-medium">Worker</div>
                        <div className="w-1/5 px-2 py-0.5 font-medium">Entries</div>
                        <div className="w-1/5 px-2 py-0.5 font-medium">Time</div>
                      </div>
                      {category.workers.map((worker, workerIndex) => (
                        <div key={workerIndex} className="flex hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]">
                          <div className="w-3/5 px-2 py-0.5 leading-none">{worker.worker}</div>
                          <div className="w-1/5 px-2 py-0.5 leading-none">{worker.entries}</div>
                          <div className="w-1/5 px-2 py-0.5 leading-none">{worker.timeInHours.toFixed(1)}h</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[min(50%,theme(spacing.80))_auto] text-xs leading-tight">
          {categories.map((category, index) => (
            <React.Fragment key={index}>
              <div className="col-start-1 border-t border-zinc-950/5 pt-2 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-2 dark:border-white/5 dark:text-zinc-400 sm:dark:border-white/5">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${category.color} mr-2`}></div>
                  {category.label}
                </div>
              </div>
              <div className="pb-2 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-2 dark:text-white dark:sm:border-white/5 sm:[&:nth-child(2)]:border-none">
                {category.hours.toFixed(1)}h ({getPercentage(category.hours)}%)
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimelinessPanel;
