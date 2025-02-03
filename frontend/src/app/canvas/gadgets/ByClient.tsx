"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import styled from "styled-components";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
import { Option } from "react-tailwindcss-select/dist/components/type";
import SectionHeader from "@/components/SectionHeader";
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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  GadgetType,
  ByClientGadgetConfig,
  GadgetProps,
} from "./types";
import { TimesheetResponse, TimesheetByClient } from "./types/timesheet";
import SelectComponent from "react-tailwindcss-select";

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

const TableWrapper = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  // Altura máxima para 15 linhas (15 * 28px por linha + cabeçalho)
  max-height: 448px;
  overflow-y: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const StyledTable = styled(Table)`
  th, td {
    padding: 4px 8px;
    font-size: 0.75rem;
    line-height: 1.25;
    height: 28px;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  thead tr {
    background: white;
  }

  th {
    font-weight: 500;
    color: #64748b;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
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

interface ByClientGadgetProps extends GadgetProps {
  config: ByClientGadgetConfig;
}

interface ClientData {
  name: string;
  totalHours: number;
}

const generateMonthYearOptions = () => {
  const options = [];
  const currentDate = new Date();
  const startDate = new Date(2024, 0); // January 2024

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

const buildTimesheetQuery = (slugs: string[]) => {
  if (slugs.length === 0) {
    return gql`
      query GetTimesheet($filters: [DatasetFilterInput]) {
        t0: timesheet(slug: "", filters: $filters) {
          byClient {
            data {
              name
              totalHours
            }
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

  const queryString = slugs
    .map(
      (slug, index) => `
        t${index}: timesheet(slug: "${slug}", filters: $filters) {
          byClient {
            data {
              name
              totalHours
            }
          }
          filterableFields {
            field
            selectedValues
            options
          }
        }
      `
    )
    .join("\n");

  return gql`
    query GetTimesheet($filters: [DatasetFilterInput]) {
      ${queryString}
    }
  `;
};

const ValueCell = styled(TableCell)<{ percentage: number }>`
  position: relative;
  background: none !important;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${props => props.percentage}%;
    background: #f8fafc;
    z-index: -1;
  }
`;

export function ByClientGadget({ id, position, type, config }: ByClientGadgetProps) {
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

  const handleSlugChange = (value: Option | Option[] | null) => {
    const newSelectedValues = Array.isArray(value) ? value : value ? [value] : [];
    setSelectedPeriods(newSelectedValues);
    // Reset filters when changing the dataset
    setSelectedFilters([]);
    setFormattedSelectedValues([]);
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

  const { loading, error, data } = useQuery(query, {
    client: client ?? undefined,
    variables: { 
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null
    },
    skip: selectedPeriods.length === 0 || !client,
    fetchPolicy: "network-only",
  });

  const clientDataByPeriod = useMemo(() => {
    if (!data) return [];
    return Object.keys(data)
      .filter(key => key.startsWith('t'))
      .map(key => {
        const periodData = data[key].byClient.data;
        const total = periodData.reduce((sum: number, client: ClientData) => sum + client.totalHours, 0);
        return {
          period: selectedPeriods.find(p => p.value === data[key].slug)?.label || '',
          data: periodData,
          total
        };
      });
  }, [data, selectedPeriods]);

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
          </Controls>
          <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
            Please select at least one period to view the client data
          </div>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          Loading client data...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#ef4444" }}>
          Error loading data: {error.message}
        </div>
      </Container>
    );
  }

  if (!data?.t0) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          No data available for this period
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
        <SectionHeader title="Hours Distribution" subtitle="By Client" />
        <TableWrapper>
          <StyledTable>
            <TableHeader>
              <TableRow>
                <TableCell></TableCell>
                {selectedPeriods.map((period, index) => (
                  <TableCell key={index} className="font-medium">
                    {period.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientDataByPeriod[0]?.data.map((client: ClientData, rowIndex: number) => (
                <TableRow key={rowIndex}>
                  <TableCell>{client.name}</TableCell>
                  {clientDataByPeriod.map((period, colIndex) => {
                    const value = period.data[rowIndex]?.totalHours || 0;
                    const percentage = (value / period.total) * 100;
                    return (
                      <ValueCell key={colIndex} percentage={percentage}>
                        {value}
                      </ValueCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </TableWrapper>
      </div>
    </Container>
  );
} 