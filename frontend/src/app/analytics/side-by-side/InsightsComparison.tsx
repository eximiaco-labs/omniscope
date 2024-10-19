import React from 'react';
import ComparisonCard from './ComparisonCard';

interface InsightsComparisonProps {
  leftInsights: any;
  rightInsights: any;
}

const InsightsComparison: React.FC<InsightsComparisonProps> = ({ leftInsights, rightInsights }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ComparisonCard title="Total Entries" leftValue={leftInsights.totalEntries} rightValue={rightInsights.totalEntries} />
      <ComparisonCard title="Unique Authors" leftValue={leftInsights.uniqueAuthors} rightValue={rightInsights.uniqueAuthors} />
      <ComparisonCard title="Average Entries per Author" leftValue={leftInsights.averageEntriesPerAuthor} rightValue={rightInsights.averageEntriesPerAuthor} />
      <ComparisonCard title="Std Dev Entries per Author" leftValue={leftInsights.stdDevEntriesPerAuthor} rightValue={rightInsights.stdDevEntriesPerAuthor} />
    </div>
  );
};

export default InsightsComparison;
