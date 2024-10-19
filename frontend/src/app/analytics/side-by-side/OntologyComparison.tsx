import React from 'react';
import ComparisonCard from './ComparisonCard';

interface OntologyComparisonProps {
  leftOntology: any;
  rightOntology: any;
}

const OntologyComparison: React.FC<OntologyComparisonProps> = ({ leftOntology, rightOntology }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ComparisonCard title="Total Entries" leftValue={leftOntology.totalEntries} rightValue={rightOntology.totalEntries} />
      <ComparisonCard title="Unique Classes" leftValue={leftOntology.uniqueClasses} rightValue={rightOntology.uniqueClasses} />
      <ComparisonCard title="Unique Authors" leftValue={leftOntology.uniqueAuthors} rightValue={rightOntology.uniqueAuthors} />
    </div>
  );
};

export default OntologyComparison;
