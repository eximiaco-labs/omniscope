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
};

type TimelinessPanelProps = {
  data: TimelinessData;
};

const TimelinessPanel: React.FC<TimelinessPanelProps> = ({ data }) => {
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
        <div className="text-sm font-bold">Timeliness Overview</div>
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
                <HoverCardContent className="w-64 z-50">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{category.label} Workers</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {category.workers.map((worker, workerIndex) => (
                        <div key={workerIndex} className="text-xs flex justify-between">
                          <span>{worker.worker}</span>
                          <span>{worker.entries} entries, {worker.timeInHours.toFixed(1)}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
              <div className="text-sm flex-grow">{category.label}</div>
              <div className="text-sm font-semibold">
                {category.hours.toFixed(1)}h ({getPercentage(category.hours)}%)
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimelinessPanel;
