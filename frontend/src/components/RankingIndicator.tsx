import React from 'react';
import { Badge } from './catalyst/badge';

interface RankingIndicatorProps {
  index: number;
  percentage: string;
}

const RankingIndicator: React.FC<RankingIndicatorProps> = ({ index, percentage}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">#{index}</span>
        </div>
        <Badge color="zinc" className="absolute -bottom-1 -right-1 text-[0.25rem] px-0.5 py-0.25 border border-zinc-200">
          {percentage}%
        </Badge>
      </div>
    </div>
  );
};

export default RankingIndicator;
