"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import styled from "styled-components";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
import SelectComponent from "react-tailwindcss-select";
import { Option } from "react-tailwindcss-select/dist/components/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import {
  GadgetType,
  TimesheetGadgetConfig,
  GadgetProps,
} from "./types";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';

const buildTimesheetQuery = (slugs: string[]) => {
  if (slugs.length === 0) {
    return gql`
      query GetTimesheet($filters: [DatasetFilterInput]) {
        t0: timesheet(slug: "", filters: $filters) {
          summary {
            totalConsultingHours
            totalInternalHours
            totalHandsOnHours
            totalSquadHours

            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkingDays
            uniqueWorkers
            uniqueAccountManagers
          }
          filterableFields {
            field
            selectedValues
            options
          }
        }
      }
    `;
  }

  const queryString = `
    query GetTimesheet($filters: [DatasetFilterInput]) {
      ${slugs
        .map(
          (slug, index) => `
            t${index}: timesheet(slug: "${slug}", filters: $filters) {
              summary {
                totalConsultingHours
                totalInternalHours
                totalHandsOnHours
                totalSquadHours

                uniqueClients
                uniqueSponsors
                uniqueCases
                uniqueWorkingDays
                uniqueWorkers
                uniqueAccountManagers
              }
              filterableFields {
                field
                selectedValues
                options
              }
            }
          `
        )
        .join("\n")}
    }
  `;

  return gql(queryString);
};

const Container = styled.div`
  min-width: 480px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.75rem;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SelectWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const FormLabel = styled.label`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const slugToTitle = (slug: string): string => {
  // Handle special cases
  if (slug === "this-month") return "This Month";
  if (slug === "previous-month") return "Previous Month";

  // Handle month-year format (e.g., october-2024)
  const monthYearMatch = slug.match(/^([a-z]+)-(\d{4})$/i);
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch;
    return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
  }

  // Default case: capitalize each word and replace hyphens with spaces
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const generateMonthYearOptions = () => {
  const options = [];
  const currentDate = new Date();
  const startDate = new Date(2024, 0); // January 2024

  // Add special options in the desired order
  options.push({ label: "Previous Month", value: "previous-month" });
  options.push({ label: "This Month", value: "this-month" });

  while (startDate <= currentDate) {
    const monthName = startDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const year = startDate.getFullYear();
    const slug = `${monthName}-${year}`;
    
    options.push({
      label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
      value: slug
    });

    startDate.setMonth(startDate.getMonth() + 1);
  }

  return options.reverse(); // Most recent first
};

const SelectedPeriodsContainer = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const SelectedPeriod = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  font-size: 0.6875rem;
  color: #475569;
  gap: 3px;
  cursor: grab;
  
  &:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: grab;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const DragHandle = styled.div`
  color: #94a3b8;
  display: flex;
  align-items: center;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 0 4px;

  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  p {
    font-size: 0.6875rem;
    color: #64748b;
    margin: 0;
  }
`;

const StyledTable = styled(Table)`
  th, td {
    padding: 4px 8px;
    font-size: 0.75rem;
    line-height: 1.25;
  }

  th {
    font-weight: 500;
    color: #64748b;
    background: #f8fafc;
  }

  td {
    color: #1e293b;
  }

  tr:hover td {
    background: #f8fafc;
  }

  td:first-child {
    color: #64748b;
    font-weight: 500;
  }

  td:not(:first-child) {
    text-align: right;
  }
`;

const StyledSelectWrapper = styled.div`
  .select-button {
    height: 24px !important;
    min-height: 24px !important;
    font-size: 0.75rem !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .select-menu {
    font-size: 0.75rem !important;
  }

  .select-option {
    font-size: 0.75rem !important;
  }
`;

interface TimesheetGadgetProps extends GadgetProps {
  config: TimesheetGadgetConfig;
}

export function TimesheetGadget({ id, position, type, config }: TimesheetGadgetProps) {
  const client = useEdgeClient();
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Option[]>(config.selectedPeriods || []);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  const monthYearOptions = useMemo(() => generateMonthYearOptions(), []);

  const query = useMemo(() => {
    const slugs = selectedPeriods.map(p => p.value);
    return buildTimesheetQuery(slugs);
  }, [selectedPeriods]);

  const { loading, error, data } = useQuery(query, {
    client: client ?? undefined,
    variables: { 
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null
    },
    skip: selectedPeriods.length === 0 || !client,
    fetchPolicy: "network-only",
  });

  const summaries = useMemo(() => {
    if (!data) return [];
    return Object.keys(data)
      .filter(key => key.startsWith('t'))
      .map(key => ({
        period: selectedPeriods.find(p => p.value === data[key].slug)?.label || '',
        summary: data[key].summary
      }));
  }, [data, selectedPeriods]);

  const handleSlugChange = (value: Option | Option[] | null) => {
    const newSelectedValues = Array.isArray(value) ? value : value ? [value] : [];
    setSelectedPeriods(newSelectedValues);
  };

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.t0?.filterableFields?.reduce((acc: any[], field: any) => {
        const fieldValues = newSelectedValues
          .filter(
            (v) =>
              typeof v.value === "string" &&
              v.value.startsWith(`${field.field}:`)
          )
          .map((v) => (v.value as string).split(":")[1]);

        if (fieldValues.length > 0) {
          acc.push({
            field: field.field,
            selectedValues: fieldValues,
          });
        }
        return acc;
      }, []) || [];

    setFormattedSelectedValues(formattedValues);
  };

  if (!client) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          Initializing connection...
        </div>
      </Container>
    );
  }

  if (selectedPeriods.length === 0) {
    return (
      <Container>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <FormLabel>Dataset Period</FormLabel>
            <StyledSelectWrapper>
              <SelectComponent
                value={selectedPeriods}
                options={monthYearOptions}
                onChange={handleSlugChange}
                primaryColor={""}
                isSearchable={true}
                isClearable={true}
                isMultiple={true}
                placeholder="Select period..."
              />
            </StyledSelectWrapper>
          </div>
          <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
            Please select at least one period to view the timesheet data
          </div>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          Loading timesheet data...
        </div>
      </Container>
    );
  }

  if (error) {
    console.error("Timesheet error:", error);
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#ef4444" }}>
          Error loading timesheet: {error.message}
        </div>
      </Container>
    );
  }

  if (!data?.t0) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          No data available for this timesheet
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Controls>
        <StyledSelectWrapper>
          <SelectComponent
            value={selectedPeriods}
            options={monthYearOptions}
            onChange={handleSlugChange}
            primaryColor={""}
            isSearchable={true}
            isClearable={true}
            isMultiple={true}
            placeholder="Select period..."
          />
        </StyledSelectWrapper>

        <FilterFieldsSelect
          data={data?.t0}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </Controls>

      <div>
        <SectionHeader title="Hours Distribution" subtitle="By Type" />
        <TableWrapper>
          <StyledTable>
            <TableBody>
              <TableRow>
                <TableCell></TableCell>
                {selectedPeriods.map((period, index) => (
                  <TableCell key={index} className="font-medium">
                    {period.label}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Consulting</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.totalConsultingHours}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Internal</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.totalInternalHours}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Hands-on</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.totalHandsOnHours}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Squad</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.totalSquadHours}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </StyledTable>
        </TableWrapper>
      </div>

      <div>
        <SectionHeader title="Engagement Metrics" subtitle="Overview" />
        <TableWrapper>
          <StyledTable>
            <TableBody>
              <TableRow>
                <TableCell></TableCell>
                {selectedPeriods.map((period, index) => (
                  <TableCell key={index} className="font-medium">
                    {period.label}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Clients</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.uniqueClients}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Sponsors</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.uniqueSponsors}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Cases</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.uniqueCases}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Days</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.uniqueWorkingDays}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Workers</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.uniqueWorkers}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Managers</TableCell>
                {summaries.map((item, index) => (
                  <TableCell key={index}>
                    {item.summary.uniqueAccountManagers}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </StyledTable>
        </TableWrapper>
      </div>
    </Container>
  );
}
