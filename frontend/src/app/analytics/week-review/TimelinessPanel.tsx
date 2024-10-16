import React from 'react';
import { motion } from 'framer-motion';

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
    { label: 'Early', hours: data.earlyTimeInHours, color: 'bg-yellow-200' },
    { label: 'On Time', hours: data.okTimeInHours, color: 'bg-green-700' },
    { label: 'Acceptable', hours: data.acceptableTimeInHours, color: 'bg-yellow-500' },
    { label: 'Late', hours: data.lateTimeInHours, color: 'bg-red-700' },
  ];

  return (
    <motion.div
      className="col-span-3 mt-4 transition-all duration-300 border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden mb-4"
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
              <div
                key={index}
                className={`h-full ${category.color}`}
                style={{ width: `${getPercentage(category.hours)}%` }}
              ></div>
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

      {/* Footer */}
      <motion.div
        className="px-4 py-2 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="text-xs font-semibold mb-1">Late Workers</div>
        <div className="max-h-20 overflow-y-auto">
          {data.lateWorkers.map((worker, index) => (
            <div key={index} className="text-xs flex justify-between">
              <span>{worker.worker}</span>
              <span>{worker.entries} entries, {worker.timeInHours.toFixed(1)}h</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimelinessPanel;
