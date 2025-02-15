import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";

interface ComparisonCardProps {
  title: string;
  leftValue: number;
  rightValue: number;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, leftValue, rightValue }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const leftPercentChange = ((leftValue - rightValue) / rightValue) * 100;
  const rightPercentChange = ((rightValue - leftValue) / leftValue) * 100;

  const formatValue = (value: number) => {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  };

  const areValuesEqual = leftValue === rightValue;
  const leftIsWinner = leftValue > rightValue;
  const rightIsWinner = rightValue > leftValue;

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Left</p>
          <motion.p
            className={`font-bold ${leftIsWinner ? 'text-3xl text-blue-600' : areValuesEqual ? 'text-2xl text-gray-700' : 'text-xl text-gray-700'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {showAnimation ? formatValue(leftValue) : '0'}
          </motion.p>
          {!areValuesEqual && (
            <motion.div
              className={`flex items-center justify-center mt-2 ${leftPercentChange < 0 ? 'text-red-600' : 'text-green-600'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {leftPercentChange < 0 ? (
                <span className="text-red-600 dark:text-red-400">▼</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">▲</span>
              )}
              <span className="text-sm font-semibold ml-1">
                {Math.abs(leftPercentChange).toFixed(1)}%
              </span>
            </motion.div>
          )}
        </div>
        <div className="text-gray-400 font-bold text-2xl">
          {areValuesEqual ? '=' : 'vs'}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Right</p>
          <motion.p
            className={`font-bold ${rightIsWinner ? 'text-3xl text-blue-600' : areValuesEqual ? 'text-2xl text-gray-700' : 'text-xl text-gray-700'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {showAnimation ? formatValue(rightValue) : '0'}
          </motion.p>
          {!areValuesEqual && (
            <motion.div
              className={`flex items-center justify-center mt-2 ${rightPercentChange > 0 ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {rightPercentChange > 0 ? (
                <span className="text-green-600 dark:text-green-400">▲</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">▼</span>
              )}
              <span className="text-sm font-semibold ml-1">
                {Math.abs(rightPercentChange).toFixed(1)}%
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
