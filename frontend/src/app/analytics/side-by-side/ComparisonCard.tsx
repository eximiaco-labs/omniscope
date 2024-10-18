import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface ComparisonCardProps {
  title: string;
  leftValue: number;
  rightValue: number;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, leftValue, rightValue }) => {
  const difference = rightValue - leftValue;
  const percentChange = ((rightValue - leftValue) / leftValue) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">Left</p>
          <p className="text-xl font-bold">{leftValue.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Right</p>
          <p className="text-xl font-bold">{rightValue.toFixed(2)}</p>
        </div>
        <div className={`flex items-center ${difference > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {difference > 0 ? (
            <ArrowUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1" />
          )}
          <span className="text-sm font-semibold">
            {Math.abs(difference).toFixed(2)} ({Math.abs(percentChange).toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
