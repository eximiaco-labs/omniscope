import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { gql, useQuery } from "@apollo/client"
import { useEdgeClient } from "@/app/hooks/useApolloClient"
import { TableHeaderComponent } from "@/app/financial/revenue-forecast/components/TableHeader"
import { TableRowComponent } from "@/app/financial/revenue-forecast/components/TableRow"
import { TableCellComponent } from "@/app/financial/revenue-forecast/components/TableCell"
import SectionHeader from "@/components/SectionHeader"
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect"
import { useState, useEffect } from "react"
import { Option } from "react-tailwindcss-select/dist/components/type"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

const GET_TIMESHEET_SUMMARY = gql`
  fragment SummaryFields on TimesheetSummary {
    uniqueClients
    uniqueWorkers
    uniqueCases
    uniqueSponsors
    uniqueAccountManagers
    uniqueWorkingDays
    
    averageHoursPerEntry
    stdDevHoursPerEntry
    
    averageHoursPerDay
    stdDevHoursPerDay
    
    averageHoursPerWorker
    stdDevHoursPerWorker
    
    averageHoursPerClient
    stdDevHoursPerClient
    
    averageHoursPerCase
    stdDevHoursPerCase
    
    averageHoursPerSponsor
    stdDevHoursPerSponsor
    
    averageHoursPerAccountManager
    stdDevHoursPerAccountManager
    
    totalConsultingHours
    totalSquadHours
    totalHandsOnHours
    totalInternalHours
  }

  query GetTimesheetSummary($filters: [DatasetFilterInput]) {
    thisMonth: timesheet(slug: "this-month", filters: $filters) {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    previousMonth: timesheet(slug: "previous-month", filters: $filters) {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    twoMonthsMonth: timesheet(slug: "two-months-ago", filters: $filters) {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    threeMonthsMonth: timesheet(slug: "three-months-ago", filters: $filters) {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
  }
`

interface TimesheetSummaryData {
  uniqueClients: number
  uniqueWorkers: number
  uniqueCases: number
  uniqueSponsors: number
  uniqueAccountManagers: number
  uniqueWorkingDays: number
  
  averageHoursPerEntry: number
  stdDevHoursPerEntry: number
  
  averageHoursPerDay: number
  stdDevHoursPerDay: number
  
  averageHoursPerWorker: number
  stdDevHoursPerWorker: number
  
  averageHoursPerClient: number
  stdDevHoursPerClient: number
  
  averageHoursPerCase: number
  stdDevHoursPerCase: number
  
  averageHoursPerSponsor: number
  stdDevHoursPerSponsor: number
  
  averageHoursPerAccountManager: number
  stdDevHoursPerAccountManager: number
  
  totalConsultingHours: number
  totalSquadHours: number
  totalHandsOnHours: number
  totalInternalHours: number
}

interface TimesheetSummaryProps {
  initialQueryFilters?: Array<{ field: string; selectedValues: string[] }>
}

const formatNumber = (num: number) => num.toFixed(2)
const formatInteger = (num: number) => Math.round(num).toString()

const getMonthName = (monthsAgo: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const TableMonthHeaders = ({ showTotals = false }) => (
  <TableRow>
    <TableHead className="border-r border-gray-400">Metric</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(3)}</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(2)}</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(1)}</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(0)}</TableHead>
    {showTotals && <TableHead className="w-[120px] border-l border-gray-200 font-bold text-center">Total</TableHead>}
  </TableRow>
)

const StatRow = ({ 
  label, 
  current, 
  previous, 
  twoMonths, 
  threeMonths,
  showTotal = false,
  formatter = formatNumber
}: { 
  label: string
  current: number
  previous: number
  twoMonths: number
  threeMonths: number
  showTotal?: boolean
  formatter?: (num: number) => string
}) => {
  const total = threeMonths + twoMonths + previous + current

  return (
    <TableRow>
      <TableCell className="font-medium border-r border-gray-400">{label}</TableCell>
      <TableCellComponent
        value={threeMonths}
        normalizedValue={threeMonths}
        normalized={false}
        previousValue={null}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      <TableCellComponent
        value={twoMonths}
        normalizedValue={twoMonths}
        normalized={false}
        previousValue={threeMonths}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      <TableCellComponent
        value={previous}
        normalizedValue={previous}
        normalized={false}
        previousValue={twoMonths}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      <TableCellComponent
        value={current}
        normalizedValue={current}
        normalized={false}
        previousValue={previous}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      {showTotal && (
        <TableCellComponent
          value={total}
          normalizedValue={total}
          normalized={false}
          previousValue={null}
          formatter={formatter}
          className="w-[120px] border-l border-gray-200 font-bold text-[12px]"
        />
      )}
    </TableRow>
  )
}

const TotalRow = ({ data }: { data: any }) => {
  const threeMonthsTotal = 
    data.threeMonthsMonth.summary.totalConsultingHours +
    data.threeMonthsMonth.summary.totalSquadHours +
    data.threeMonthsMonth.summary.totalHandsOnHours +
    data.threeMonthsMonth.summary.totalInternalHours

  const twoMonthsTotal = 
    data.twoMonthsMonth.summary.totalConsultingHours +
    data.twoMonthsMonth.summary.totalSquadHours +
    data.twoMonthsMonth.summary.totalHandsOnHours +
    data.twoMonthsMonth.summary.totalInternalHours

  const previousTotal = 
    data.previousMonth.summary.totalConsultingHours +
    data.previousMonth.summary.totalSquadHours +
    data.previousMonth.summary.totalHandsOnHours +
    data.previousMonth.summary.totalInternalHours

  const currentTotal = 
    data.thisMonth.summary.totalConsultingHours +
    data.thisMonth.summary.totalSquadHours +
    data.thisMonth.summary.totalHandsOnHours +
    data.thisMonth.summary.totalInternalHours

  const grandTotal = threeMonthsTotal + twoMonthsTotal + previousTotal + currentTotal

  return (
    <TableRow className="font-bold border-t-2">
      <TableCell className="border-r border-gray-400">Total</TableCell>
      <TableCellComponent
        value={threeMonthsTotal}
        normalizedValue={threeMonthsTotal}
        normalized={false}
        previousValue={null}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={twoMonthsTotal}
        normalizedValue={twoMonthsTotal}
        normalized={false}
        previousValue={threeMonthsTotal}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={previousTotal}
        normalizedValue={previousTotal}
        normalized={false}
        previousValue={twoMonthsTotal}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={currentTotal}
        normalizedValue={currentTotal}
        normalized={false}
        previousValue={previousTotal}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={grandTotal}
        normalizedValue={grandTotal}
        normalized={false}
        previousValue={null}
        formatter={formatNumber}
        className="w-[120px] border-l border-gray-200 font-bold text-[12px]"
      />
    </TableRow>
  )
}

export function TimesheetSummary({ initialQueryFilters }: TimesheetSummaryProps) {
  const client = useEdgeClient();
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >(initialQueryFilters || []);

  // Convert API filter values to Options format
  const convertToOptions = (filterableFields: Array<{ field: string, options: string[], selectedValues: string[] }>) => {
    return filterableFields.reduce((acc: Option[], field) => {
      const fieldOptions = field.selectedValues.map(value => ({
        value: `${field.field}:${value}`,
        label: value
      }));
      return [...acc, ...fieldOptions];
    }, []);
  };
  
  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues = data?.thisMonth?.filterableFields?.reduce((acc: any[], field: any) => {
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
  
  if (!client) return <p>Loading client...</p>;
  
  const { loading, error, data } = useQuery(GET_TIMESHEET_SUMMARY, {
    client,
    variables: {
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    ssr: true
  });

  useEffect(() => {
    if (data?.thisMonth?.filterableFields) {
      const options = convertToOptions(data.thisMonth.filterableFields);
      setSelectedFilters(options);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const chartData = [
    {
      name: getMonthName(3),
      consulting: data.threeMonthsMonth.summary.totalConsultingHours,
      squad: data.threeMonthsMonth.summary.totalSquadHours,
      handsOn: data.threeMonthsMonth.summary.totalHandsOnHours,
      internal: data.threeMonthsMonth.summary.totalInternalHours,
    },
    {
      name: getMonthName(2),
      consulting: data.twoMonthsMonth.summary.totalConsultingHours,
      squad: data.twoMonthsMonth.summary.totalSquadHours,
      handsOn: data.twoMonthsMonth.summary.totalHandsOnHours,
      internal: data.twoMonthsMonth.summary.totalInternalHours,
    },
    {
      name: getMonthName(1),
      consulting: data.previousMonth.summary.totalConsultingHours,
      squad: data.previousMonth.summary.totalSquadHours,
      handsOn: data.previousMonth.summary.totalHandsOnHours,
      internal: data.previousMonth.summary.totalInternalHours,
    },
    {
      name: getMonthName(0),
      consulting: data.thisMonth.summary.totalConsultingHours,
      squad: data.thisMonth.summary.totalSquadHours,
      handsOn: data.thisMonth.summary.totalHandsOnHours,
      internal: data.thisMonth.summary.totalInternalHours,
    },
  ];

  // Check which kinds have non-zero values
  const activeKinds = {
    consulting: chartData.some(d => d.consulting > 0),
    squad: chartData.some(d => d.squad > 0),
    handsOn: chartData.some(d => d.handsOn > 0),
    internal: chartData.some(d => d.internal > 0),
  };

  const barConfig = [
    { dataKey: "consulting", name: "Consulting", fill: "#F59E0B" },
    { dataKey: "squad", name: "Squad", fill: "#3B82F6" },
    { dataKey: "handsOn", name: "Hands-On", fill: "#8B5CF6" },
    { dataKey: "internal", name: "Internal", fill: "#10B981" },
  ].filter(config => activeKinds[config.dataKey as keyof typeof activeKinds]);

  return (
    <div className="space-y-8">
      <div className="relative z-[40]">
        <FilterFieldsSelect
          data={data?.thisMonth}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>

      {/* Total Hours Section */}
      <div>
        <SectionHeader 
          title="Total Hours by Kind" 
          subtitle="Distribution of hours across different work kinds"
        />
        <div className="mx-2">
          <div className="h-[400px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2), 'Hours']}
                />
                <Legend />
                {barConfig.map(config => (
                  <Bar 
                    key={config.dataKey}
                    dataKey={config.dataKey}
                    name={config.name}
                    fill={config.fill}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table>
            <TableHeader>
              <TableMonthHeaders showTotals={true} />
            </TableHeader>
            <TableBody>
              {(() => {
                const rows = [
                  {
                    label: "Consulting Hours",
                    current: data.thisMonth.summary.totalConsultingHours,
                    previous: data.previousMonth.summary.totalConsultingHours,
                    twoMonths: data.twoMonthsMonth.summary.totalConsultingHours,
                    threeMonths: data.threeMonthsMonth.summary.totalConsultingHours,
                  },
                  {
                    label: "Squad Hours",
                    current: data.thisMonth.summary.totalSquadHours,
                    previous: data.previousMonth.summary.totalSquadHours,
                    twoMonths: data.twoMonthsMonth.summary.totalSquadHours,
                    threeMonths: data.threeMonthsMonth.summary.totalSquadHours,
                  },
                  {
                    label: "Hands-on Hours",
                    current: data.thisMonth.summary.totalHandsOnHours,
                    previous: data.previousMonth.summary.totalHandsOnHours,
                    twoMonths: data.twoMonthsMonth.summary.totalHandsOnHours,
                    threeMonths: data.threeMonthsMonth.summary.totalHandsOnHours,
                  },
                  {
                    label: "Internal Hours",
                    current: data.thisMonth.summary.totalInternalHours,
                    previous: data.previousMonth.summary.totalInternalHours,
                    twoMonths: data.twoMonthsMonth.summary.totalInternalHours,
                    threeMonths: data.threeMonthsMonth.summary.totalInternalHours,
                  }
                ].filter(row => 
                  row.current + row.previous + row.twoMonths + row.threeMonths > 0
                );

                return (
                  <>
                    {rows.map(row => (
                      <StatRow 
                        key={row.label}
                        label={row.label}
                        current={row.current}
                        previous={row.previous}
                        twoMonths={row.twoMonths}
                        threeMonths={row.threeMonths}
                        showTotal={true}
                      />
                    ))}
                    {rows.length > 1 && <TotalRow data={data} />}
                  </>
                );
              })()}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Overview Section */}
      <div>
        <SectionHeader 
          title="Unique Entries Overview" 
          subtitle="Analysis of unique entities across different dimensions"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <TableMonthHeaders />
            </TableHeader>
            <TableBody>
              <StatRow 
                label="Unique Clients"
                current={data.thisMonth.summary.uniqueClients}
                previous={data.previousMonth.summary.uniqueClients}
                twoMonths={data.twoMonthsMonth.summary.uniqueClients}
                threeMonths={data.threeMonthsMonth.summary.uniqueClients}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Workers"
                current={data.thisMonth.summary.uniqueWorkers}
                previous={data.previousMonth.summary.uniqueWorkers}
                twoMonths={data.twoMonthsMonth.summary.uniqueWorkers}
                threeMonths={data.threeMonthsMonth.summary.uniqueWorkers}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Cases"
                current={data.thisMonth.summary.uniqueCases}
                previous={data.previousMonth.summary.uniqueCases}
                twoMonths={data.twoMonthsMonth.summary.uniqueCases}
                threeMonths={data.threeMonthsMonth.summary.uniqueCases}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Sponsors"
                current={data.thisMonth.summary.uniqueSponsors}
                previous={data.previousMonth.summary.uniqueSponsors}
                twoMonths={data.twoMonthsMonth.summary.uniqueSponsors}
                threeMonths={data.threeMonthsMonth.summary.uniqueSponsors}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Account Managers"
                current={data.thisMonth.summary.uniqueAccountManagers}
                previous={data.previousMonth.summary.uniqueAccountManagers}
                twoMonths={data.twoMonthsMonth.summary.uniqueAccountManagers}
                threeMonths={data.threeMonthsMonth.summary.uniqueAccountManagers}
                formatter={formatInteger}
              />
              <StatRow 
                label="Working Days"
                current={data.thisMonth.summary.uniqueWorkingDays}
                previous={data.previousMonth.summary.uniqueWorkingDays}
                twoMonths={data.twoMonthsMonth.summary.uniqueWorkingDays}
                threeMonths={data.threeMonthsMonth.summary.uniqueWorkingDays}
                formatter={formatInteger}
              />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Averages Section */}
      <div>
        <SectionHeader 
          title="Averages and Standard Deviations" 
          subtitle="Statistical analysis of time distribution"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <TableMonthHeaders />
            </TableHeader>
            <TableBody>
              <StatRow 
                label="Avg Hours/Entry"
                current={data.thisMonth.summary.averageHoursPerEntry}
                previous={data.previousMonth.summary.averageHoursPerEntry}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerEntry}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerEntry}
              />
              <StatRow 
                label="StdDev Hours/Entry"
                current={data.thisMonth.summary.stdDevHoursPerEntry}
                previous={data.previousMonth.summary.stdDevHoursPerEntry}
                twoMonths={data.twoMonthsMonth.summary.stdDevHoursPerEntry}
                threeMonths={data.threeMonthsMonth.summary.stdDevHoursPerEntry}
              />
              <StatRow 
                label="Avg Hours/Day"
                current={data.thisMonth.summary.averageHoursPerDay}
                previous={data.previousMonth.summary.averageHoursPerDay}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerDay}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerDay}
              />
              <StatRow 
                label="StdDev Hours/Day"
                current={data.thisMonth.summary.stdDevHoursPerDay}
                previous={data.previousMonth.summary.stdDevHoursPerDay}
                twoMonths={data.twoMonthsMonth.summary.stdDevHoursPerDay}
                threeMonths={data.threeMonthsMonth.summary.stdDevHoursPerDay}
              />
              <StatRow 
                label="Avg Hours/Worker"
                current={data.thisMonth.summary.averageHoursPerWorker}
                previous={data.previousMonth.summary.averageHoursPerWorker}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerWorker}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerWorker}
              />
              <StatRow 
                label="Avg Hours/Client"
                current={data.thisMonth.summary.averageHoursPerClient}
                previous={data.previousMonth.summary.averageHoursPerClient}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerClient}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerClient}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
