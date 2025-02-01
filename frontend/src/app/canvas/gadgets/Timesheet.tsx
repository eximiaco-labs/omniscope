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
  GadgetType,
  TimesheetGadgetConfig,
  GadgetSettingsProps,
  GadgetProps,
} from "./types";

const GET_TIMESHEET = gql`
  query GetTimesheet($slug: String!, $filters: [DatasetFilterInput]) {
    timesheet(slug: $slug, filters: $filters) {
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

const Container = styled.div`
  min-width: 400px;
  padding: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Section = styled.tr`
  &:not(:last-child) td {
    border-bottom: 1px solid #e2e8f0;
  }
`;

const SectionHeader = styled.td`
  padding: 12px 8px;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;

  &[colspan="2"] {
    border-bottom: 2px solid #e2e8f0;
  }
`;

const Label = styled.td`
  padding: 8px;
  color: #64748b;
  font-size: 14px;
  text-align: left;
  width: 70%;
`;

const Value = styled.td`
  padding: 8px;
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  width: 30%;
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

export function TimesheetSettings({
  config,
  onChange,
}: GadgetSettingsProps<TimesheetGadgetConfig>) {
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
            slug: newSlug,
            title: slugToTitle(newSlug),
          });
        }}
        placeholder="Enter dataset slug (e.g., previous-month)"
      />
    </FormGroup>
  );
}

interface TimesheetGadgetProps {
  config: TimesheetGadgetConfig;
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

export function TimesheetGadget({ config }: TimesheetGadgetProps) {
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

  const { loading, error, data } = useQuery(GET_TIMESHEET, {
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

  if (!data?.timesheet?.summary) {
    return (
      <Container>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
          No data available for this timesheet
        </div>
      </Container>
    );
  }

  const summary = data.timesheet.summary;

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
      <div className="mt-4">
        <Table>
          <tbody>
            <Section>
              <SectionHeader colSpan={2}>Hours Distribution</SectionHeader>
            </Section>
            <Section>
              <Label>Consulting Hours</Label>
              <Value>{summary.totalConsultingHours}</Value>
            </Section>
            <Section>
              <Label>Internal Hours</Label>
              <Value>{summary.totalInternalHours}</Value>
            </Section>
            <Section>
              <Label>Hands-on Hours</Label>
              <Value>{summary.totalHandsOnHours}</Value>
            </Section>
            <Section>
              <Label>Squad Hours</Label>
              <Value>{summary.totalSquadHours}</Value>
            </Section>

            <Section>
              <SectionHeader colSpan={2}>Engagement Metrics</SectionHeader>
            </Section>
            <Section>
              <Label>Unique Clients</Label>
              <Value>{summary.uniqueClients}</Value>
            </Section>
            <Section>
              <Label>Unique Sponsors</Label>
              <Value>{summary.uniqueSponsors}</Value>
            </Section>
            <Section>
              <Label>Unique Cases</Label>
              <Value>{summary.uniqueCases}</Value>
            </Section>
            <Section>
              <Label>Working Days</Label>
              <Value>{summary.uniqueWorkingDays}</Value>
            </Section>
            <Section>
              <Label>Active Workers</Label>
              <Value>{summary.uniqueWorkers}</Value>
            </Section>
            <Section>
              <Label>Account Managers</Label>
              <Value>{summary.uniqueAccountManagers}</Value>
            </Section>
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
