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
  GadgetSettingsProps,
  GadgetProps,
} from "./types";

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
  min-width: 400px;
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled.div`
  margin-top: 1rem;
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
            type: GadgetType.TIMESHEET,
            slug: newSlug,
            title: slugToTitle(newSlug),
          });
        }}
        placeholder="Enter dataset slug (e.g., previous-month)"
      />
    </FormGroup>
  );
}

interface TimesheetGadgetProps extends GadgetProps {
  config: TimesheetGadgetConfig;
}

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

export function TimesheetGadget({ id, position, type, config, onConfigure }: TimesheetGadgetProps) {
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
    
    if (newSelectedValues.length > 0) {
      // Reset filters when changing the dataset
      setSelectedFilters([]);
      setFormattedSelectedValues([]);
      
      // Update the config
      onConfigure({
        id,
        type,
        position,
        config: {
          ...config,
          selectedPeriods: newSelectedValues,
          slug: newSelectedValues[0].value,
          title: slugToTitle(newSelectedValues[0].value)
        }
      });
    } else {
      // Clear the config when no period is selected
      onConfigure({
        id,
        type,
        position,
        config: {
          ...config,
          selectedPeriods: [],
          slug: "",
          title: ""
        }
      });
    }
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
            <SelectComponent
              value={selectedPeriods}
              options={monthYearOptions}
              onChange={handleSlugChange}
              primaryColor={""}
              isSearchable={true}
              isClearable={true}
              isMultiple={true}
              placeholder="Select dataset period..."
            />
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
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <SelectComponent
            value={selectedPeriods}
            options={monthYearOptions}
            onChange={handleSlugChange}
            primaryColor={""}
            isSearchable={true}
            isClearable={true}
            isMultiple={true}
            placeholder="Select dataset period..."
          />
        </div>

        <FilterFieldsSelect
          data={data?.t0}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>

      <div className="mt-4 space-y-6">
        <div>
          <SectionHeader title="Hours Distribution" subtitle="By Type" />
          <TableWrapper>
            <Table>
              <TableBody>
                <TableRow className="border-b">
                  <TableCell className="text-muted-foreground font-medium"></TableCell>
                  {selectedPeriods.map((period, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {period.label}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Consulting Hours</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.totalConsultingHours}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Internal Hours</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.totalInternalHours}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Hands-on Hours</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.totalHandsOnHours}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Squad Hours</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.totalSquadHours}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableWrapper>
        </div>

        <div>
          <SectionHeader title="Engagement Metrics" subtitle="Overview" />
          <TableWrapper>
            <Table>
              <TableBody>
                <TableRow className="border-b">
                  <TableCell className="text-muted-foreground font-medium"></TableCell>
                  {selectedPeriods.map((period, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {period.label}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Unique Clients</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.uniqueClients}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Unique Sponsors</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.uniqueSponsors}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Unique Cases</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.uniqueCases}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Working Days</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.uniqueWorkingDays}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Active Workers</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.uniqueWorkers}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Account Managers</TableCell>
                  {summaries.map((item, index) => (
                    <TableCell key={index} className="text-right font-medium text-foreground">
                      {item.summary.uniqueAccountManagers}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableWrapper>
        </div>
      </div>
    </Container>
  );
}
