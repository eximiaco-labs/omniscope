import React from 'react';

interface ComparisonCardProps {
  title: string;
  leftValue: number;
  rightValue: number;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, leftValue, rightValue }) => {
  const leftPercentChange = ((leftValue - rightValue) / rightValue) * 100;
  const rightPercentChange = ((rightValue - leftValue) / leftValue) * 100;

  const formatValue = (value: number) => {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  };

  const areValuesEqual = leftValue === rightValue;
  const leftIsWinner = leftValue > rightValue;
  const rightIsWinner = rightValue > leftValue;

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Left</p>
          <p className={`font-bold text-gray-700 ${leftIsWinner ? 'text-3xl' : areValuesEqual ? 'text-2xl' : 'text-xl'}`}>
            {formatValue(leftValue)}
          </p>
          {!areValuesEqual && (
            <div className={`flex items-center justify-center mt-2 ${leftPercentChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {leftPercentChange < 0 ? (
                <span className="text-red-600 dark:text-red-400">▼</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">▲</span>
              )}
              <span className="text-sm font-semibold ml-1">
                {Math.abs(leftPercentChange).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="text-gray-400 font-bold text-2xl">
          {areValuesEqual ? '=' : 'vs'}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Right</p>
          <p className={`font-bold text-gray-700 ${rightIsWinner ? 'text-3xl' : areValuesEqual ? 'text-2xl' : 'text-xl'}`}>
            {formatValue(rightValue)}
          </p>
          {!areValuesEqual && (
            <div className={`flex items-center justify-center mt-2 ${rightPercentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {rightPercentChange > 0 ? (
                <span className="text-green-600 dark:text-green-400">▲</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">▼</span>
              )}
              <span className="text-sm font-semibold ml-1">
                {Math.abs(rightPercentChange).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
