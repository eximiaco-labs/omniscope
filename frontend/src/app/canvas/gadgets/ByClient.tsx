"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import styled from "styled-components";
import { useEdgeClient } from "@/app/hooks/useApolloClient";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect";
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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  GadgetType,
  ByClientGadgetConfig,
  GadgetSettingsProps,
  GadgetProps,
} from "./types";
import { TimesheetResponse, TimesheetByClient } from "./types/timesheet";

const GET_TIMESHEET = gql`
  query GetTimesheet($slug: String!, $filters: [DatasetFilterInput]) {
    timesheet(slug: $slug, filters: $filters) {
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

const Container = styled.div`
  min-width: 400px;
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled.div<{ shouldScroll: boolean }>`
  margin-top: 1rem;
  max-height: ${props => props.shouldScroll ? '400px' : 'auto'};
  overflow-y: ${props => props.shouldScroll ? 'auto' : 'visible'};

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

export function ByClientSettings({
  config,
  onChange,
}: GadgetSettingsProps<ByClientGadgetConfig>) {
  return (
    <FormGroup>
      <FormLabel htmlFor="slug">Dataset Slug</FormLabel>
      <Input
        id="slug"
        value={config.slug}
        onChange={(e) => {
          const newSlug = e.target.value;
          onChange({
            ...config,
            type: GadgetType.BY_CLIENT,
            slug: newSlug,
            title: slugToTitle(newSlug),
          });
        }}
        placeholder="Enter dataset slug (e.g., previous-month)"
      />
    </FormGroup>
  );
}

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

export function ByClientGadget({ id, position, type, config, onConfigure }: ByClientGadgetProps) {
  const client = useEdgeClient();
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);

  const monthYearOptions = useMemo(() => generateMonthYearOptions(), []);

  const handleSlugChange = (newSlug: string) => {
    // Reset filters when changing the dataset
    setSelectedFilters([]);
    setFormattedSelectedValues([]);
    
    // Update the config
    config.slug = newSlug;
    config.title = slugToTitle(newSlug);
  };

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.timesheet?.filterableFields?.reduce((acc: any[], field: any) => {
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

  const { loading, error, data } = useQuery<TimesheetResponse>(GET_TIMESHEET, {
    client: client ?? undefined,
    variables: { 
      slug: config.slug,
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null
    },
    skip: !config.slug || !client,
    fetchPolicy: "network-only",
  });

  if (!client) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          Initializing connection...
        </div>
      </Container>
    );
  }

  if (!config.slug) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          Please configure the dataset slug in settings
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

  if (!data?.timesheet?.byClient?.data) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          No data available for this timesheet
        </div>
      </Container>
    );
  }

  const clientData = data.timesheet.byClient.data as ClientData[];
  const shouldScroll = clientData.length > 10;

  return (
    <Container>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <FormLabel>Dataset Period</FormLabel>
          <Select
            value={config.slug}
            onValueChange={handleSlugChange}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select month and year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="previous-month">Previous Month</SelectItem>
              <SelectSeparator />
              {monthYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FilterFieldsSelect
          data={data?.timesheet}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>
      
      <TableWrapper shouldScroll={shouldScroll}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-foreground">Client</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Total Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientData.map((client: ClientData, index: number) => (
              <TableRow key={index}>
                <TableCell className="text-muted-foreground">{client.name}</TableCell>
                <TableCell className="text-right font-medium text-foreground">{client.totalHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </Container>
  );
} 