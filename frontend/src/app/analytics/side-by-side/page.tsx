"use client";

import React, { useState, useEffect } from 'react';
import { useLazyQuery } from "@apollo/client";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import { GET_TIMESHEET, GET_ONTOLOGY, GET_INSIGHTS } from '../datasets/datasetQueries';
import Select from "react-tailwindcss-select";
import TimesheetComparison from './TimesheetComparison';
import OntologyComparison from './OntologyComparison';
import InsightsComparison from './InsightsComparison';
import SideBySideDatasetSelector from './SideBySideDatasetSelector';

interface FilterableField {
  field: string;
  selectedValues: string[];
  options: string[];
}

interface FilterOption {
  value: string;
  label: string;
}

export default function SideBySide() {
  const [leftDataset, setLeftDataset] = useState<string>('timesheet-previous-week');
  const [rightDataset, setRightDataset] = useState<string>('timesheet-this-week');
  const [leftFilters, setLeftFilters] = useState<FilterOption[]>([]);
  const [rightFilters, setRightFilters] = useState<FilterOption[]>([]);
  const [leftFilterableFields, setLeftFilterableFields] = useState<FilterableField[]>([]);
  const [rightFilterableFields, setRightFilterableFields] = useState<FilterableField[]>([]);

  const [getLeftTimesheet, { loading: leftTimesheetLoading, error: leftTimesheetError, data: leftTimesheetData }] = useLazyQuery(GET_TIMESHEET);
  const [getRightTimesheet, { loading: rightTimesheetLoading, error: rightTimesheetError, data: rightTimesheetData }] = useLazyQuery(GET_TIMESHEET);
  const [getLeftOntology, { loading: leftOntologyLoading, error: leftOntologyError, data: leftOntologyData }] = useLazyQuery(GET_ONTOLOGY);
  const [getRightOntology, { loading: rightOntologyLoading, error: rightOntologyError, data: rightOntologyData }] = useLazyQuery(GET_ONTOLOGY);
  const [getLeftInsights, { loading: leftInsightsLoading, error: leftInsightsError, data: leftInsightsData }] = useLazyQuery(GET_INSIGHTS);
  const [getRightInsights, { loading: rightInsightsLoading, error: rightInsightsError, data: rightInsightsData }] = useLazyQuery(GET_INSIGHTS);

  useEffect(() => {
    fetchData(leftDataset, 'left');
    fetchData(rightDataset, 'right');
  }, [leftDataset, rightDataset, leftFilters, rightFilters]);

  const fetchData = (dataset: string, side: 'left' | 'right') => {
    const fetchFunction = getFetchFunction(dataset, side);
    const filters = side === 'left' ? leftFilters : rightFilters;

    const formattedFilters = filters.map(filter => {
      const [field, value] = filter.value.split(':');
      return { field, selectedValues: [value] };
    });

    fetchFunction({
      variables: {
        slug: dataset,
        filters: formattedFilters
      }
    });
  };

  const getFetchFunction = (dataset: string, side: 'left' | 'right') => {
    if (dataset.startsWith('timesheet')) return side === 'left' ? getLeftTimesheet : getRightTimesheet;
    if (dataset.startsWith('ontology')) return side === 'left' ? getLeftOntology : getRightOntology;
    if (dataset.startsWith('insights')) return side === 'left' ? getLeftInsights : getRightInsights;
    return side === 'left' ? getLeftTimesheet : getRightTimesheet; // Default to timesheet query
  };

  const handleDatasetSelect = (value: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftDataset(value);
      // Reset right dataset if it's not of the same kind
      if (!rightDataset.startsWith(value.split('-')[0])) {
        setRightDataset('');
      }
    } else {
      setRightDataset(value);
    }
    // Reset filters when dataset changes
    if (side === 'left') {
      setLeftFilters([]);
    } else {
      setRightFilters([]);
    }
  };

  useEffect(() => {
    if (leftTimesheetData?.timesheet?.filterableFields) {
      setLeftFilterableFields(leftTimesheetData.timesheet.filterableFields);
    } else if (leftOntologyData?.ontology?.filterableFields) {
      setLeftFilterableFields(leftOntologyData.ontology.filterableFields);
    } else if (leftInsightsData?.insights?.filterableFields) {
      setLeftFilterableFields(leftInsightsData.insights.filterableFields);
    }
  }, [leftTimesheetData, leftOntologyData, leftInsightsData]);

  useEffect(() => {
    if (rightTimesheetData?.timesheet?.filterableFields) {
      setRightFilterableFields(rightTimesheetData.timesheet.filterableFields);
    } else if (rightOntologyData?.ontology?.filterableFields) {
      setRightFilterableFields(rightOntologyData.ontology.filterableFields);
    } else if (rightInsightsData?.insights?.filterableFields) {
      setRightFilterableFields(rightInsightsData.insights.filterableFields);
    }
  }, [rightTimesheetData, rightOntologyData, rightInsightsData]);

  const handleFilterChange = (newFilters: FilterOption[], side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftFilters(newFilters);
    } else {
      setRightFilters(newFilters);
    }
  };

  const renderFilterSelector = (side: 'left' | 'right') => {
    const filters = side === 'left' ? leftFilters : rightFilters;
    const filterableFields = side === 'left' ? leftFilterableFields : rightFilterableFields;

    return (
      <Select
        value={filters}
        options={filterableFields.map((f: FilterableField) => ({
          label: f.field,
          options: f.options.map((o: string) => ({
            value: `${f.field}:${o}`,
            label: o,
          }))
        }))}
        placeholder="Filters..."
        onChange={(value): void => handleFilterChange(Array.isArray(value) ? value : [], side)}
        primaryColor={""}
        isMultiple={true}
        isSearchable={true}
        isClearable={true}
        formatGroupLabel={(data) => (
          <div className={`py-2 text-xs flex items-center justify-between`}>
            <span className="font-bold uppercase">
              {data.label
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/(Name|Title)$/, '')}
            </span>
            <span className="bg-gray-200 h-5 w-5 p-1.5 flex items-center justify-center rounded-full">
              {data.options.length}
            </span>
          </div>
        )}
      />
    );
  };

  const renderComparison = () => {
    if (leftDataset.startsWith('timesheet') && rightDataset.startsWith('timesheet')) {
      return leftTimesheetData?.timesheet && rightTimesheetData?.timesheet ? (
        <TimesheetComparison leftTimesheet={leftTimesheetData.timesheet} rightTimesheet={rightTimesheetData.timesheet} />
      ) : null;
    } else if (leftDataset.startsWith('ontology') && rightDataset.startsWith('ontology')) {
      return leftOntologyData?.ontology && rightOntologyData?.ontology ? (
        <OntologyComparison leftOntology={leftOntologyData.ontology} rightOntology={rightOntologyData.ontology} />
      ) : null;
    } else if (leftDataset.startsWith('insights') && rightDataset.startsWith('insights')) {
      return leftInsightsData?.insights && rightInsightsData?.insights ? (
        <InsightsComparison leftInsights={leftInsightsData.insights} rightInsights={rightInsightsData.insights} />
      ) : null;
    }
    return <p>Please select datasets of the same type for comparison.</p>;
  };

  const isLoading = leftTimesheetLoading || rightTimesheetLoading || leftOntologyLoading || rightOntologyLoading || leftInsightsLoading || rightInsightsLoading;
  const error = leftTimesheetError || rightTimesheetError || leftOntologyError || rightOntologyError || leftInsightsError || rightInsightsError;

  return (
    <div>
      <Heading>Side-by-side Comparison</Heading>
      <Divider className="my-3" />
      
      <div className="grid grid-cols-2 gap-4 mb-2">
        <SideBySideDatasetSelector
          id="left-dataset-selector"
          selectedDataset={leftDataset}
          onDatasetSelect={(value) => handleDatasetSelect(value, 'left')}
        />
        <SideBySideDatasetSelector
          id="right-dataset-selector"
          selectedDataset={rightDataset}
          onDatasetSelect={(value) => handleDatasetSelect(value, 'right')}
          filterKind={leftDataset ? leftDataset.split('-')[0] : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {renderFilterSelector('left')}
        {renderFilterSelector('right')}
      </div>

      {isLoading && <p className="text-center py-5">Loading...</p>}
      {error && (
        <p className="text-center py-5 text-red-500">
          Error: {error.message}
        </p>
      )}

      {renderComparison()}
    </div>
  );
}
